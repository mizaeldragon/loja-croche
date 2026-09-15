import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, notFound, parse } from '../lib/http.js'
import { requireAuth } from '../middleware/auth.js'

export const ordersRouter = Router()

// ------------------------------------------------------------- orçamentos

const quoteSchema = z
  .object({
    name: z.string().min(3, 'Informe seu nome').max(120),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    message: z.string().max(2000).default(''),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: 'Informe um e-mail ou telefone para contato',
    path: ['email'],
  })

// Público: formulário de orçamento da landing page.
ordersRouter.post(
  '/orcamentos',
  asyncRoute(async (req, res) => {
    const data = parse(quoteSchema, req.body)
    const quote = await prisma.quote.create({
      data: {
        name: data.name,
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone || null,
        message: data.message,
      },
    })
    res.status(201).json({ id: quote.id, numero: quote.number })
  })
)

ordersRouter.get(
  '/admin/orcamentos',
  requireAuth,
  asyncRoute(async (_req, res) => {
    res.json(await prisma.quote.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }))
  })
)

ordersRouter.patch(
  '/admin/orcamentos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = parse(
      z.object({
        status: z.enum(['novo', 'em_andamento', 'respondido', 'fechado']).optional(),
        notes: z.string().max(2000).nullable().optional(),
      }),
      req.body
    )
    res.json(await prisma.quote.update({ where: { id: req.params.id }, data }))
  })
)

ordersRouter.delete(
  '/admin/orcamentos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    await prisma.quote.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)

// ----------------------------------------------------------------- pedidos

const serialize = (o) => ({
  ...o,
  subtotal: Number(o.subtotal),
  shippingCost: Number(o.shippingCost),
  discount: Number(o.discount),
  total: Number(o.total),
  items: o.items?.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
})

ordersRouter.get(
  '/admin/pedidos',
  requireAuth,
  asyncRoute(async (req, res) => {
    // Filtros vêm da query string: valida contra os enums para um valor
    // inventado virar 400 em vez de estourar no driver.
    const filterSchema = z.object({
      status: z.enum(['novo', 'em_andamento', 'enviado', 'concluido', 'cancelado']).optional(),
      pagamento: z.enum(['pendente', 'pago', 'recusado', 'estornado']).optional(),
    })
    const { status, pagamento } = parse(filterSchema, req.query)

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(pagamento ? { paymentStatus: pagamento } : {}),
      },
      include: { items: true, customer: true, address: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })

    res.json(orders.map(serialize))
  })
)

ordersRouter.get(
  '/admin/pedidos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true, customer: true, address: true },
    })
    if (!order) throw notFound('Pedido não encontrado')
    res.json(serialize(order))
  })
)

const updateSchema = z.object({
  status: z.enum(['novo', 'em_andamento', 'enviado', 'concluido', 'cancelado']).optional(),
  trackingCode: z.string().max(60).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

ordersRouter.patch(
  '/admin/pedidos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = parse(updateSchema, req.body)
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { items: true, customer: true, address: true },
    })
    res.json(serialize(order))
  })
)

// Métricas do dashboard do painel.
ordersRouter.get(
  '/admin/metricas',
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [produtos, publicados, pedidos, pagos, faturamento, semEstoque] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'published' } }),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'pago' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'pago' } }),
      prisma.product.count({ where: { stock: 0, status: 'published' } }),
    ])

    res.json({
      produtos,
      publicados,
      pedidos,
      pagos,
      faturamento: Number(faturamento._sum.total ?? 0),
      semEstoque,
    })
  })
)
