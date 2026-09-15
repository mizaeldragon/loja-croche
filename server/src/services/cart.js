import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { badRequest } from '../lib/http.js'
import { decimalToCents } from '../lib/money.js'

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  color: z.string().max(60).optional(),
  size: z.string().max(60).optional(),
})

export const cartSchema = z.array(cartItemSchema).min(1, 'Carrinho vazio').max(50)

// Preço efetivamente cobrado: promoção vale quando existe e é menor que o cheio.
export function effectivePriceCents(product) {
  const full = decimalToCents(product.price)
  if (product.promoPrice == null) return full
  const promo = decimalToCents(product.promoPrice)
  return promo > 0 && promo < full ? promo : full
}

/**
 * Resolve o carrinho enviado pelo cliente contra o banco.
 *
 * Regra de ouro: o front manda apenas productId + quantidade. Preço, peso e
 * dimensões vêm SEMPRE do banco — assim ninguém compra por R$ 1,00 editando
 * o payload no DevTools.
 */
export async function resolveCart(rawItems) {
  const ids = [...new Set(rawItems.map((i) => i.productId))]

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: 'published' },
  })

  const byId = new Map(products.map((p) => [p.id, p]))

  const missing = ids.filter((id) => !byId.has(id))
  if (missing.length) {
    throw badRequest('Produto indisponível no carrinho', { produtos: missing })
  }

  // Junta linhas iguais (mesmo produto + cor + tamanho) antes de validar estoque.
  const merged = new Map()
  for (const item of rawItems) {
    const key = `${item.productId}|${item.color ?? ''}|${item.size ?? ''}`
    const current = merged.get(key)
    if (current) current.quantity += item.quantity
    else merged.set(key, { ...item })
  }

  const items = []
  let subtotalCents = 0

  for (const item of merged.values()) {
    const product = byId.get(item.productId)

    if (product.stock < item.quantity) {
      throw badRequest(
        `Estoque insuficiente para "${product.name}" (disponível: ${product.stock})`,
        { productId: product.id, disponivel: product.stock }
      )
    }

    const unitPriceCents = effectivePriceCents(product)
    subtotalCents += unitPriceCents * item.quantity

    items.push({
      product,
      productId: product.id,
      productName: product.name,
      unitPriceCents,
      quantity: item.quantity,
      color: item.color ?? null,
      size: item.size ?? null,
    })
  }

  return { items, subtotalCents }
}
