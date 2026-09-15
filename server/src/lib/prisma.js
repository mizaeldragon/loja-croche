import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

// `node --watch` recria o módulo a cada save; sem o cache global
// cada reload abriria um novo pool de conexões.
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: env.isProd ? ['error'] : ['warn', 'error'],
  })

if (!env.isProd) globalForPrisma.__prisma = prisma
