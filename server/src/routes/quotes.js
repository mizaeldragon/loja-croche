import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, parse } from '../lib/http.js'
import { requireAuth } from '../middleware/auth.js'

export const quotesRouter = Router()

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
quotesRouter.post(
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

quotesRouter.get(
  '/admin/orcamentos',
  requireAuth,
  asyncRoute(async (_req, res) => {
    res.json(await prisma.quote.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }))
  })
)

quotesRouter.patch(
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

quotesRouter.delete(
  '/admin/orcamentos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    await prisma.quote.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)
