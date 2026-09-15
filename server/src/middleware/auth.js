import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'
import { forbidden, unauthorized } from '../lib/http.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: '8h',
  })
}

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(unauthorized())

  try {
    req.user = jwt.verify(token, env.JWT_SECRET)
    next()
  } catch {
    next(unauthorized('Sessão expirada'))
  }
}

// Rotas destrutivas (deletar produto, gerenciar usuários) só para admin.
export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(forbidden('Ação restrita a administradores'))
  next()
}
