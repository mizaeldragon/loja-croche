import { Router } from 'express'
import { z } from 'zod'
import { asyncRoute, badRequest, parse } from '../lib/http.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { getStatus, saveConfig } from '../services/integrations.js'
import {
  cidadeAtendida,
  getDeliverySettings,
  limparCacheCidade,
  saveDeliverySettings,
} from '../services/localDelivery.js'
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

// ---------------------------------------------------------- entrega local
// Não é credencial, é política de entrega da loja — por isso só exige sessão,
// não o papel de administrador.

integrationsRouter.get(
  '/admin/entrega',
  requireAuth,
  asyncRoute(async (_req, res) => {
    const [cfg, cidade] = await Promise.all([getDeliverySettings(), cidadeAtendida()])
    res.json({
      ...cfg,
      localPrice: Number(cfg.localPrice),
      // Derivada do CEP de origem — o painel só exibe, ela não digita.
      cidadeAtendida: cidade,
    })
  })
)

const entregaSchema = z.object({
  localEnabled: z.boolean().optional(),
  localLabel: z.string().min(3).max(60).optional(),
  localPrice: z.number().min(0).max(9999).optional(),
  localDays: z.number().int().min(0).max(60).optional(),
  pickupEnabled: z.boolean().optional(),
  pickupLabel: z.string().min(3).max(60).optional(),
  pickupInstructions: z.string().max(500).nullable().optional(),
})

integrationsRouter.put(
  '/admin/entrega',
  requireAuth,
  asyncRoute(async (req, res) => {
    const data = parse(entregaSchema, req.body)

    // A cidade atendida vem do CEP de origem. Sem ele, não há como saber quem
    // é "local" — as opções ficariam invisíveis e a lojista acharia que salvou
    // e não funcionou.
    const cidade = await cidadeAtendida()
    if ((data.localEnabled || data.pickupEnabled) && !cidade) {
      throw badRequest(
        'Preencha o CEP de origem antes de ativar a entrega local — é ele que define a cidade atendida.'
      )
    }

    // Guardamos a cidade resolvida só para exibição no painel e no histórico.
    const cfg = await saveDeliverySettings({
      ...data,
      ...(cidade ? { localCity: cidade.city, localState: cidade.state } : {}),
    })
    limparCacheCidade()
    res.json({ ...cfg, localPrice: Number(cfg.localPrice), cidadeAtendida: cidade })
  })
)
