import 'dotenv/config'
import { z } from 'zod'

// Falhar no boot é melhor do que descobrir um segredo faltando
// com o site já no ar.
const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter ao menos 32 caracteres'),
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
