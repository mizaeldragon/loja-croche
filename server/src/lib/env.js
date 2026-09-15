import 'dotenv/config'
import { z } from 'zod'

// Falhar no boot é melhor do que descobrir um segredo faltando
// no meio de um checkout real.
const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  PUBLIC_SITE_URL: z.string().url().default('http://localhost:5173'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter ao menos 32 caracteres'),

  // Chave mestra que cifra os tokens das integrações guardados no banco.
  // Perder esta chave = a lojista precisa colar os tokens de novo.
  CREDENTIALS_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'CREDENTIALS_KEY precisa ter 64 caracteres hexadecimais'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
  console.error('Configuração inválida:\n' + issues.join('\n'))
  process.exit(1)
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  isProd: parsed.data.NODE_ENV === 'production',
}

// Nota: as credenciais de Mercado Pago e Melhor Envio NÃO ficam aqui.
// São da lojista, não da infraestrutura, e vivem cifradas no banco para ela
// poder trocá-las pelo painel sem redeploy. Ver src/services/integrations.js.
