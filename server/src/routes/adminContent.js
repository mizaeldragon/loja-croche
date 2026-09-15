import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, badRequest, parse } from '../lib/http.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

export const adminContentRouter = Router()

const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Tudo aqui exige sessão do painel.
adminContentRouter.use('/admin', requireAuth)

// ------------------------------------------------------------- categorias

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).nullable().optional(),
  image: z.string().nullable().optional(),
  order: z.number().int().default(0),
})

adminContentRouter.get(
  '/admin/categorias',
  asyncRoute(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    res.json(categories.map((c) => ({ ...c, productCount: c._count.products })))
  })
)

adminContentRouter.post(
  '/admin/categorias',
  asyncRoute(async (req, res) => {
    const data = parse(categorySchema, req.body)
    const category = await prisma.category.create({
      data: { ...data, slug: slugify(data.name) },
    })
    res.status(201).json(category)
  })
)

adminContentRouter.put(
  '/admin/categorias/:id',
  asyncRoute(async (req, res) => {
    const data = parse(categorySchema.partial(), req.body)
    const category = await prisma.category.update({ where: { id: req.params.id }, data })
    res.json(category)
  })
)

adminContentRouter.delete(
  '/admin/categorias/:id',
  requireAdmin,
  asyncRoute(async (req, res) => {
    // Produtos ficam sem categoria (onDelete: SetNull), mas avisamos antes
    // para a exclusão não ser uma surpresa.
    const count = await prisma.product.count({ where: { categoryId: req.params.id } })
    if (count > 0 && req.query.force !== 'true') {
      throw badRequest(
        `Esta categoria tem ${count} produto(s). Repita com ?force=true para excluir mesmo assim.`,
        { produtos: count }
      )
    }
    await prisma.category.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)

// ------------------------------------------------------------ depoimentos

const testimonialSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().max(120).nullable().optional(),
  text: z.string().min(5).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  avatar: z.string().nullable().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
})

adminContentRouter.get(
  '/admin/depoimentos',
  asyncRoute(async (_req, res) => {
    res.json(await prisma.testimonial.findMany({ orderBy: { order: 'asc' } }))
  })
)

adminContentRouter.post(
  '/admin/depoimentos',
  asyncRoute(async (req, res) => {
    const data = parse(testimonialSchema, req.body)
    res.status(201).json(await prisma.testimonial.create({ data }))
  })
)

adminContentRouter.put(
  '/admin/depoimentos/:id',
  asyncRoute(async (req, res) => {
    const data = parse(testimonialSchema.partial(), req.body)
    res.json(await prisma.testimonial.update({ where: { id: req.params.id }, data }))
  })
)

adminContentRouter.delete(
  '/admin/depoimentos/:id',
  asyncRoute(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)

// -------------------------------------------------------------------- faq

const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(2000),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
})

adminContentRouter.get(
  '/admin/faqs',
  asyncRoute(async (_req, res) => {
    res.json(await prisma.faq.findMany({ orderBy: { order: 'asc' } }))
  })
)

adminContentRouter.post(
  '/admin/faqs',
  asyncRoute(async (req, res) => {
    const data = parse(faqSchema, req.body)
    res.status(201).json(await prisma.faq.create({ data }))
  })
)

adminContentRouter.put(
  '/admin/faqs/:id',
  asyncRoute(async (req, res) => {
    const data = parse(faqSchema.partial(), req.body)
    res.json(await prisma.faq.update({ where: { id: req.params.id }, data }))
  })
)

adminContentRouter.delete(
  '/admin/faqs/:id',
  asyncRoute(async (req, res) => {
    await prisma.faq.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)

// ------------------------------------------------- configurações e banners

// O conteúdo editorial é livre demais para um schema rígido: o painel edita
// blocos aninhados (destaques, benefícios, carrossel). Validamos só o formato.
const jsonObject = z.record(z.any())

adminContentRouter.get(
  '/admin/conteudo',
  asyncRoute(async (_req, res) => {
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } })
    res.json({ settings: settings?.data ?? {}, banners: settings?.banners ?? {} })
  })
)

adminContentRouter.put(
  '/admin/configuracoes',
  asyncRoute(async (req, res) => {
    const data = parse(jsonObject, req.body)
    const current = await prisma.settings.findUnique({ where: { id: 'default' } })
    const merged = { ...(current?.data ?? {}), ...data }

    const saved = await prisma.settings.upsert({
      where: { id: 'default' },
      update: { data: merged },
      create: { id: 'default', data: merged, banners: {} },
    })
    res.json(saved.data)
  })
)

adminContentRouter.put(
  '/admin/banners',
  asyncRoute(async (req, res) => {
    const data = parse(jsonObject, req.body)
    const current = await prisma.settings.findUnique({ where: { id: 'default' } })
    const merged = { ...(current?.banners ?? {}), ...data }

    const saved = await prisma.settings.upsert({
      where: { id: 'default' },
      update: { banners: merged },
      create: { id: 'default', data: {}, banners: merged },
    })
    res.json(saved.banners)
  })
)

// ------------------------------------------------------------- usuários

// O painel fala em `status: 'ativo'|'inativo'`; o banco guarda um booleano.
const serializeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  avatar: u.avatar,
  status: u.active ? 'ativo' : 'inativo',
  lastLoginAt: u.lastLoginAt,
})

const userSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(10, 'A senha precisa de ao menos 10 caracteres').optional(),
  role: z.enum(['admin', 'editor']).default('editor'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
  avatar: z.string().nullable().optional(),
})

adminContentRouter.get(
  '/admin/usuarios',
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } })
    res.json(users.map(serializeUser))
  })
)

adminContentRouter.post(
  '/admin/usuarios',
  requireAdmin,
  asyncRoute(async (req, res) => {
    const data = parse(userSchema, req.body)
    if (!data.password) throw badRequest('Defina uma senha para o novo usuário')

    const user = await prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 12),
        role: data.role,
        avatar: data.avatar ?? null,
        active: data.status === 'ativo',
      },
    })
    res.status(201).json(serializeUser(user))
  })
)

adminContentRouter.put(
  '/admin/usuarios/:id',
  requireAdmin,
  asyncRoute(async (req, res) => {
    const data = parse(userSchema.partial(), req.body)

    // Impede a última administradora ativa de se rebaixar ou se desativar,
    // o que deixaria o painel sem ninguém capaz de gerenciar usuários.
    if (data.role === 'editor' || data.status === 'inativo') {
      const admins = await prisma.adminUser.count({ where: { role: 'admin', active: true } })
      const target = await prisma.adminUser.findUnique({ where: { id: req.params.id } })
      if (admins <= 1 && target?.role === 'admin' && target?.active) {
        throw badRequest('Este é o último administrador ativo — promova outro antes de alterar.')
      }
    }

    const user = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email ? { email: data.email.toLowerCase() } : {}),
        ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 12) } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.status ? { active: data.status === 'ativo' } : {}),
      },
    })
    res.json(serializeUser(user))
  })
)

adminContentRouter.delete(
  '/admin/usuarios/:id',
  requireAdmin,
  asyncRoute(async (req, res) => {
    if (req.params.id === req.user.sub) {
      throw badRequest('Você não pode excluir seu próprio usuário.')
    }
    const admins = await prisma.adminUser.count({ where: { role: 'admin', active: true } })
    const target = await prisma.adminUser.findUnique({ where: { id: req.params.id } })
    if (admins <= 1 && target?.role === 'admin') {
      throw badRequest('Este é o último administrador — crie outro antes de excluir.')
    }

    await prisma.adminUser.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)

// ---------------------------------------------------- extras de produtos

// Duplicar: gera rascunho com nome e slug novos.
adminContentRouter.post(
  '/admin/produtos/:id/duplicar',
  asyncRoute(async (req, res) => {
    const original = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!original) throw badRequest('Produto não encontrado')

    const { id, createdAt, updatedAt, ...rest } = original
    const copy = await prisma.product.create({
      data: {
        ...rest,
        name: `${original.name} (Cópia)`,
        slug: `${original.slug}-copia-${Date.now().toString(36)}`,
        status: 'draft',
      },
      include: { category: true },
    })
    res.status(201).json({ ...copy, price: Number(copy.price) })
  })
)

// Reordenar: recebe os ids na ordem desejada.
adminContentRouter.post(
  '/admin/produtos/reordenar',
  asyncRoute(async (req, res) => {
    const { ids } = parse(z.object({ ids: z.array(z.string()).min(1) }), req.body)

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({ where: { id }, data: { order: index + 1 } })
      )
    )
    res.status(204).end()
  })
)
