import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, notFound, parse } from '../lib/http.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

export const catalogRouter = Router()

const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Preço Decimal do Prisma vira number no JSON, que é o que o front espera.
const serializeProduct = (p) => ({
  ...p,
  price: Number(p.price),
  promoPrice: p.promoPrice == null ? null : Number(p.promoPrice),
  category: p.category?.slug ?? null,
  categoryName: p.category?.name ?? null,
})

// ------------------------------------------------------------------ público

catalogRouter.get(
  '/produtos',
  asyncRoute(async (req, res) => {
    const { categoria, busca, destaque } = req.query

    const products = await prisma.product.findMany({
      where: {
        status: 'published',
        ...(categoria ? { category: { slug: String(categoria) } } : {}),
        ...(destaque === 'true' ? { featured: true } : {}),
        ...(busca
          ? {
              OR: [
                { name: { contains: String(busca), mode: 'insensitive' } },
                { description: { contains: String(busca), mode: 'insensitive' } },
                { tags: { has: String(busca).toLowerCase() } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    res.json(products.map(serializeProduct))
  })
)

catalogRouter.get(
  '/produtos/:slug',
  asyncRoute(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: 'published' },
      include: { category: true },
    })
    if (!product) throw notFound('Produto não encontrado')
    res.json(serializeProduct(product))
  })
)

catalogRouter.get(
  '/categorias',
  asyncRoute(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    res.json(categories)
  })
)

catalogRouter.get(
  '/conteudo',
  asyncRoute(async (_req, res) => {
    const [settings, faqs, testimonials] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 'default' } }),
      prisma.faq.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
      prisma.testimonial.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    ])

    res.json({
      settings: settings?.data ?? {},
      banners: settings?.banners ?? {},
      faqs,
      testimonials,
    })
  })
)

// ------------------------------------------------------------------- admin

const productSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(5000).default(''),
  price: z.number().nonnegative(),
  promoPrice: z.number().nonnegative().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  images: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  stock: z.number().int().min(0).default(0),
  order: z.number().int().default(0),
  // Sem estes campos o frete não é calculável — por isso são obrigatórios aqui.
  weightGrams: z.number().int().min(1, 'Informe o peso em gramas').max(30000),
  heightCm: z.number().int().min(1).max(100),
  widthCm: z.number().int().min(1).max(100),
  lengthCm: z.number().int().min(1).max(100),
  seoTitle: z.string().max(160).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
})

catalogRouter.get(
  '/admin/produtos',
  requireAuth,
  asyncRoute(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    res.json(products.map(serializeProduct))
  })
)

catalogRouter.post(
  '/admin/produtos',
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = parse(productSchema, req.body)
    const product = await prisma.product.create({
      data: { ...data, slug: `${slugify(data.name)}-${Date.now().toString(36)}` },
      include: { category: true },
    })
    res.status(201).json(serializeProduct(product))
  })
)

catalogRouter.put(
  '/admin/produtos/:id',
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = parse(productSchema.partial(), req.body)
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    })
    res.json(serializeProduct(product))
  })
)

catalogRouter.delete(
  '/admin/produtos/:id',
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.status(204).end()
  })
)
