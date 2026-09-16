import { Router } from 'express'
import { z } from 'zod'
import { asyncRoute, badRequest, parse } from '../lib/http.js'
import { cartSchema, resolveCart } from '../services/cart.js'
import { simularParcelas } from '../services/installments.js'
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

// GET /api/parcelas?valores=20,28,360 — simulação de parcelamento.
// Fica aqui junto do frete por ser da mesma natureza: informação que a
// vitrine consulta antes de existir pedido.
shippingRouter.get(
  '/parcelas',
  asyncRoute(async (req, res) => {
    const bruto = String(req.query.valores ?? '')
    const valores = bruto
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v) && v > 0)
      .slice(0, 50)

    if (!valores.length) throw badRequest('Informe ao menos um valor em ?valores=')

    res.json(await simularParcelas(valores))
  })
)
