// Migra o catálogo que hoje vive em src/lib/seed.js (localStorage) para o Postgres.
// Idempotente: pode rodar quantas vezes quiser (upsert por slug/email).

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

import {
  seedBanners,
  seedCategories,
  seedFaqs,
  seedProducts,
  seedSettings,
  seedTestimonials,
} from '../../src/lib/seed.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Semeando banco...')

  // ---- categorias ----
  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image, order: c.order },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order,
      },
    })
  }
  console.log(`  categorias: ${seedCategories.length}`)

  const categoriasPorSlug = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  )

  // ---- produtos ----
  for (const p of seedProducts) {
    const data = {
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      promoPrice: p.promoPrice ?? null,
      status: p.status === 'published' ? 'published' : 'draft',
      categoryId: categoriasPorSlug.get(p.category) ?? null,
      images: p.images ?? [],
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      tags: p.tags ?? [],
      featured: Boolean(p.featured),
      bestseller: Boolean(p.bestseller),
      isNew: Boolean(p.isNew),
      stock: p.stock ?? 0,
      order: p.order ?? 0,
      seoTitle: p.seoTitle ?? null,
      seoDescription: p.seoDescription ?? null,
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { ...data, slug: p.slug },
    })
  }
  console.log(`  produtos: ${seedProducts.length}`)

  // ---- depoimentos ----
  for (const [i, t] of seedTestimonials.entries()) {
    const existente = await prisma.testimonial.findFirst({ where: { name: t.name, text: t.text } })
    if (existente) continue
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role ?? null,
        text: t.text,
        rating: t.rating ?? 5,
        avatar: t.avatar ?? null,
        visible: true,
        order: i,
      },
    })
  }
  console.log(`  depoimentos: ${seedTestimonials.length}`)

  // ---- faq ----
  for (const [i, f] of seedFaqs.entries()) {
    const existente = await prisma.faq.findFirst({ where: { question: f.question } })
    if (existente) continue
    await prisma.faq.create({
      data: { question: f.question, answer: f.answer, order: i, visible: true },
    })
  }
  console.log(`  faqs: ${seedFaqs.length}`)

  // ---- conteúdo do site ----
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', data: seedSettings, banners: seedBanners },
  })
  console.log('  configurações e banners: ok')

  // ---- admin ----
  const email = (process.env.SEED_ADMIN_EMAIL ?? '').toLowerCase()
  const senha = process.env.SEED_ADMIN_PASSWORD ?? ''

  if (!email || senha.length < 10) {
    console.warn(
      '  ! admin NÃO criado: defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD (mín. 10 caracteres)'
    )
  } else {
    const passwordHash = await bcrypt.hash(senha, 12)
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, active: true, role: 'admin' },
      create: { name: 'Administradora', email, passwordHash, role: 'admin' },
    })
    console.log(`  admin: ${email}`)
  }

  console.log('Pronto.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
