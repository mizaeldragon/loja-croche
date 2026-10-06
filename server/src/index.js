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
import { quotesRouter } from './routes/quotes.js'

const app = express()

// Railway roda atrás de proxy: sem isso o rate limit vê o IP errado
// e req.protocol volta http mesmo em HTTPS.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      // Sem origin = curl / health check — liberado.
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
  })
)

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false, db: false })
  }
})

app.use('/api', authRouter)
app.use('/api', catalogRouter)
app.use('/api', adminContentRouter)
app.use('/api', quotesRouter)

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

const server = app.listen(env.PORT, () => {
  console.log(`API em http://localhost:${env.PORT}`)
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
