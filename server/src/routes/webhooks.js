import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { asyncRoute } from '../lib/http.js'
import { getPayment, mapPaymentStatus } from '../services/mercadoPago.js'

export const webhooksRouter = Router()

/**
 * POST /api/webhooks/mercadopago
 *
 * Confirmação de pagamento. Duas garantias importantes aqui:
 *
 * 1. Nada do corpo da notificação é levado a sério. A notificação só nos diz
 *    "olhe o pagamento X"; quem responde o que aconteceu é a API do Mercado
 *    Pago, consultada com o token da loja. Uma notificação forjada aponta para
 *    um pagamento que não existe na conta e morre aqui. É por isso que não
 *    exigimos a chave secreta de assinatura — ela seria defesa extra, não a
 *    principal, e custaria mais um campo de configuração para a lojista.
 *
 * 2. Idempotência. O Mercado Pago reenvia a mesma notificação até receber 2xx.
 *    O registro em WebhookEvent e a baixa de estoque acontecem na MESMA
 *    transação: ou os dois valem, ou nenhum vale. Registrar o evento antes de
 *    processar faria uma falha de rede virar pagamento perdido — a retentativa
 *    chegaria e seria descartada como duplicada.
 */
webhooksRouter.post(
  '/webhooks/mercadopago',
  asyncRoute(async (req, res) => {
    const dataId = req.query['data.id'] ?? req.body?.data?.id
    const topic = req.query.type ?? req.body?.type ?? req.query.topic

    if (topic !== 'payment' || !dataId) {
      return res.status(200).json({ ignored: true })
    }

    // Consulta antes de escrever qualquer coisa: se falhar, nada foi gravado
    // e a retentativa do Mercado Pago funciona normalmente.
    let payment
    try {
      payment = await getPayment(dataId)
    } catch (err) {
      console.error('[mp-webhook] não consegui consultar o pagamento', dataId, err.message)
      // 500 de propósito: queremos que o Mercado Pago tente de novo.
      return res.status(500).json({ error: 'falha ao consultar o pagamento' })
    }

    const orderId = payment?.external_reference
    if (!orderId) return res.status(200).json({ ignored: true })

    const paymentStatus = mapPaymentStatus(payment.status)

    try {
      await prisma.$transaction(async (tx) => {
        // A constraint única em (provider, externalId) é o cadeado: se este
        // evento já foi processado, o create explode e a transação inteira
        // é abortada sem tocar em nada.
        await tx.webhookEvent.create({
          data: {
            provider: 'mercadopago',
            externalId: String(dataId),
            payload: req.body ?? {},
          },
        })

        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        })
        if (!order) return

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus,
            mpPaymentId: String(payment.id),
            paidAt: paymentStatus === 'pago' ? new Date() : null,
            status: paymentStatus === 'recusado' ? 'cancelado' : order.status,
          },
        })

        // Baixa de estoque acontece uma única vez, na aprovação.
        if (paymentStatus === 'pago' && !order.stockApplied) {
          for (const item of order.items) {
            if (!item.productId) continue
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          }
          await tx.order.update({
            where: { id: order.id },
            data: { stockApplied: true },
          })
        }

        // Estorno devolve o estoque.
        if (paymentStatus === 'estornado' && order.stockApplied) {
          for (const item of order.items) {
            if (!item.productId) continue
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }
          await tx.order.update({
            where: { id: order.id },
            data: { stockApplied: false },
          })
        }
      })
    } catch (err) {
      if (err.code === 'P2002') return res.status(200).json({ duplicate: true })
      throw err
    }

    res.status(200).json({ ok: true })
  })
)
