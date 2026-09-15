import { Router } from 'express'
import { z } from 'zod'
import { asyncRoute, parse } from '../lib/http.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { getStatus, saveConfig } from '../services/integrations.js'
import { testShippingCredentials } from '../services/melhorEnvio.js'
import { testPaymentCredentials } from '../services/mercadoPago.js'

export const integrationsRouter = Router()

// Credenciais de pagamento são o ativo mais sensível da loja: só administrador.
integrationsRouter.use('/admin/integracoes', requireAuth, requireAdmin)

integrationsRouter.get(
  '/admin/integracoes',
  asyncRoute(async (_req, res) => {
    res.json(await getStatus())
  })
)

// Campo ausente = mantém o que está salvo. String vazia = apagar.
// É o que permite salvar só o CEP sem precisar recolar os tokens.
const saveSchema = z.object({
  mpAccessToken: z.string().max(500).optional(),

  meToken: z.string().max(2000).optional(),
  meMode: z.enum(['sandbox', 'production']).optional(),
  meContactEmail: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  shipFromZip: z
    .string()
    .optional()
    .refine(
      (v) => v === undefined || v === '' || v.replace(/\D/g, '').length === 8,
      'CEP precisa ter 8 dígitos'
    ),
})

integrationsRouter.put(
  '/admin/integracoes',
  asyncRoute(async (req, res) => {
    res.json(await saveConfig(parse(saveSchema, req.body)))
  })
)

// Testes de conexão: confirmam a credencial sem cobrar ninguém nem postar nada.
// Devolvem 200 com { ok: false } em caso de credencial inválida — é resultado
// esperado do teste, não erro da requisição.
integrationsRouter.post(
  '/admin/integracoes/testar-pagamento',
  asyncRoute(async (_req, res) => {
    try {
      res.json(await testPaymentCredentials())
    } catch (err) {
      res.json({ ok: false, message: err.message })
    }
  })
)

integrationsRouter.post(
  '/admin/integracoes/testar-frete',
  asyncRoute(async (_req, res) => {
    try {
      res.json(await testShippingCredentials())
    } catch (err) {
      res.json({ ok: false, message: err.message })
    }
  })
)
