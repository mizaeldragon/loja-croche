import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, badRequest, parse } from '../lib/http.js'
import { fromCents, toCents } from '../lib/money.js'
import { cartSchema, resolveCart } from '../services/cart.js'
import { normalizeZip } from '../services/melhorEnvio.js'
import { getShippingOptions } from '../services/shippingOptions.js'
import { createPreference } from '../services/mercadoPago.js'

export const checkoutRouter = Router()

const checkoutSchema = z.object({
  items: cartSchema,
  customer: z.object({
    name: z.string().min(3, 'Informe o nome completo').max(120),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido').max(20),
    document: z
      .string()
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length === 0 || v.length === 11, 'CPF inválido')
      .optional(),
  }),
  // Só o CEP é sempre obrigatório: ele define quais entregas estão disponíveis.
  // Os demais campos são exigidos conforme o tipo escolhido — na retirada não
  // existe endereço de entrega, e pedi-lo seria atrito à toa.
  address: z.object({
    zip: z.string().min(8).max(9),
    street: z.string().max(160).optional(),
    number: z.string().max(20).optional(),
    complement: z.string().max(80).optional(),
    district: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    state: z.string().max(2).optional(),
  }),
  // Só o ID do serviço: o preço é recotado aqui no servidor.
  shippingOptionId: z.string().min(1, 'Escolha uma opção de entrega'),
})

// POST /api/checkout — cria o pedido e devolve a URL de pagamento.
checkoutRouter.post(
  '/checkout',
  asyncRoute(async (req, res) => {
    const data = parse(checkoutSchema, req.body)

    // 1. Preços e estoque vêm do banco, não do cliente.
    const { items, subtotalCents } = await resolveCart(data.items)

    // 2. Recotamos o frete e usamos o valor da nossa cotação. O cliente
    //    escolhe o serviço; quem define o preço é o Melhor Envio.
    const options = await getShippingOptions({ zip: data.address.zip, items })
    const chosen = options.find((o) => o.id === data.shippingOptionId)
    if (!chosen) {
      throw badRequest('Opção de entrega indisponível — recalcule o frete', {
        disponiveis: options.map((o) => o.id),
      })
    }

    // Retirada não tem endereço de entrega; qualquer outra forma tem.
    const precisaEndereco = chosen.tipo !== 'retirada'
    if (precisaEndereco) {
      const faltando = ['street', 'number', 'district', 'city', 'state'].filter(
        (c) => !data.address[c]
      )
      if (faltando.length) {
        throw badRequest(
          'Endereço incompleto para esta forma de entrega',
          faltando.map((c) => ({ campo: `address.${c}`, erro: 'Campo obrigatório' }))
        )
      }
    }

    const shippingCents = toCents(chosen.price)
    const totalCents = subtotalCents + shippingCents

    // 3. Persiste pedido + cliente + endereço numa transação.
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: data.customer.name,
          email: data.customer.email.toLowerCase(),
          phone: data.customer.phone,
          document: data.customer.document || null,
        },
      })

      return tx.order.create({
        data: {
          customerId: customer.id,
          subtotal: fromCents(subtotalCents),
          shippingCost: fromCents(shippingCents),
          total: fromCents(totalCents),
          shippingType: chosen.tipo,
          shippingService: chosen.name,
          shippingCarrier: chosen.carrier,
          shippingDays: chosen.days,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              unitPrice: fromCents(i.unitPriceCents),
              quantity: i.quantity,
              color: i.color,
              size: i.size,
            })),
          },
          ...(precisaEndereco
            ? {
                address: {
                  create: {
                    zip: normalizeZip(data.address.zip),
                    street: data.address.street,
                    number: data.address.number,
                    complement: data.address.complement || null,
                    district: data.address.district,
                    city: data.address.city,
                    state: data.address.state.toUpperCase(),
                  },
                },
              }
            : {}),
        },
        include: { items: true, customer: true },
      })
    })

    // 4. Cria a preference no Mercado Pago.
    const apiBaseUrl = `${req.protocol}://${req.get('host')}`
    const { preferenceId, checkoutUrl } = await createPreference({
      order,
      items,
      shippingCents,
      customer: data.customer,
      apiBaseUrl,
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preferenceId },
    })

    res.status(201).json({
      pedidoId: order.id,
      numero: order.number,
      subtotal: fromCents(subtotalCents),
      frete: fromCents(shippingCents),
      total: fromCents(totalCents),
      checkoutUrl,
    })
  })
)

// GET /api/pedidos/:id/status — usado pelas páginas de retorno do checkout.
// Público de propósito, mas expõe só o mínimo (sem dados do cliente).
checkoutRouter.get(
  '/pedidos/:id/status',
  asyncRoute(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: {
        number: true,
        status: true,
        paymentStatus: true,
        total: true,
        trackingCode: true,
        createdAt: true,
      },
    })

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' })
    res.json(order)
  })
)
