import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { asyncRoute, parse, unauthorized } from '../lib/http.js'
import { requireAuth, signToken } from '../middleware/auth.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' },
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post(
  '/auth/login',
  loginLimiter,
  asyncRoute(async (req, res) => {
    const { email, password } = parse(loginSchema, req.body)

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Mensagem genérica de propósito: não revelamos se o e-mail existe.
    const ok = user?.active && (await bcrypt.compare(password, user.passwordHash))
    if (!ok) throw unauthorized('E-mail ou senha incorretos')

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
  })
)

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncRoute(async (req, res) => {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.user.sub },
      select: { id: true, name: true, email: true, role: true, active: true },
    })
    if (!user?.active) throw unauthorized()
    res.json(user)
  })
)
