import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './lib/env.js'
import { HttpError } from './lib/http.js'
import { prisma } from './lib/prisma.js'
import { adminContentRouter } from './routes/adminContent.js'
import { authRouter } from './routes/auth.js'
import { catalogRouter } from './routes/catalog.js'
import { checkoutRouter } from './routes/checkout.js'
import { integrationsRouter } from './routes/integrations.js'
import { ordersRouter } from './routes/orders.js'
import { shippingRouter } from './routes/shipping.js'
import { webhooksRouter } from './routes/webhooks.js'
import { getPaymentConfig, getShippingConfig } from './services/integrations.js'

const app = express()

// Railway roda atrás de proxy: sem isso o rate limit vê o IP errado
// e req.protocol volta http mesmo em HTTPS.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      // Sem origin = curl / health check / webhook do MP — liberado.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true)
      callback(new HttpError(403, `Origem não permitida: ${origin}`))
    },
  })
)
app.use(express.json({ limit: '1mb' }))

app.use(
  '/api',
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    // O MP pode enviar rajadas de notificação; não faz sentido limitá-lo.
    skip: (req) => req.path.startsWith('/webhooks/'),
  })
)

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    const [pagamento, frete] = await Promise.all([getPaymentConfig(), getShippingConfig()])
    res.json({
      ok: true,
      // Sem expor credencial: só se está configurada e em que modo.
      integracoes: {
        pagamentos: { configurado: pagamento.configured },
        frete: { configurado: frete.configured, modo: frete.mode },
      },
    })
  } catch {
    res.status(503).json({ ok: false, db: false })
  }
})

app.use('/api', authRouter)
app.use('/api', catalogRouter)
app.use('/api', adminContentRouter)
app.use('/api', shippingRouter)
app.use('/api', checkoutRouter)
app.use('/api', ordersRouter)
app.use('/api', integrationsRouter)
app.use('/api', webhooksRouter)

app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada' }))

// Handler global — última linha de defesa.
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details })
  }

  // Violação de unique do Prisma.
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Registro já existe' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado' })
  }

  console.error('[erro]', err)
  res.status(500).json({
    error: env.isProd ? 'Erro interno' : err.message,
  })
})

const server = app.listen(env.PORT, async () => {
  console.log(`API em http://localhost:${env.PORT}`)

  // As integrações agora vivem no banco, então só dá para saber o estado
  // depois de subir. Aviso serve para não descobrir na primeira venda.
  try {
    const [pagamento, frete] = await Promise.all([getPaymentConfig(), getShippingConfig()])
    if (!pagamento.configured) console.warn('! Pagamentos não configurados (painel → Integrações)')
    if (!frete.configured) console.warn('! Frete não configurado (painel → Integrações)')
  } catch {
    console.warn('! Não foi possível ler as integrações ainda (banco sem migração?)')
  }
})

// Railway envia SIGTERM no redeploy: fecha conexões antes de morrer.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(async () => {
      await prisma.$disconnect()
      process.exit(0)
    })
  })
}
