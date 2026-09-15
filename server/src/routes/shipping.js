import { Router } from 'express'
import { z } from 'zod'
import { asyncRoute, parse } from '../lib/http.js'
import { cartSchema, resolveCart } from '../services/cart.js'
import { normalizeZip, quoteShipping } from '../services/melhorEnvio.js'

export const shippingRouter = Router()

const quoteSchema = z.object({
  zip: z.string().min(8).max(9),
  items: cartSchema,
})

// POST /api/frete — opções de entrega para o CEP informado.
shippingRouter.post(
  '/frete',
  asyncRoute(async (req, res) => {
    const { zip, items } = parse(quoteSchema, req.body)
    const { items: resolved, subtotalCents } = await resolveCart(items)

    const options = await quoteShipping({ zip, items: resolved })

    res.json({
      cep: normalizeZip(zip),
      subtotal: subtotalCents / 100,
      opcoes: options,
    })
  })
)

// GET /api/cep/:cep — consulta de endereço para autopreencher o checkout.
// Proxy do ViaCEP (público e sem chave) para evitar CORS no browser.
shippingRouter.get(
  '/cep/:cep',
  asyncRoute(async (req, res) => {
    const cep = normalizeZip(req.params.cep)
    const upstream = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await upstream.json()

    if (data.erro) return res.status(404).json({ error: 'CEP não encontrado' })

    res.json({
      cep,
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    })
  })
)
