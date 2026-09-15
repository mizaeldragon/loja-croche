import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { notifySuccess } from '../../store/useToastStore'
import Toaster from '../../components/ui/Toaster'
import Logo from '../../components/ui/Logo'

export default function Login() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.ok) {
      notifySuccess('Bem-vinda de volta!')
      navigate('/admin')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#FDD7CA_0%,_#FFF7F3_60%)] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-grain" />
      <div className="relative w-full max-w-md animate-fadeUp">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo
            name="Angel Art"
            tagline="Ateliê de Crochê"
            className="flex-col gap-3"
            markClassName="h-24 w-24"
          />
        </div>

        <form onSubmit={submit} className="card-surface space-y-5 p-8">
          <div>
            <h2 className="font-display text-lg text-espresso-800">Acessar sua conta</h2>
            <p className="mt-1 text-sm text-espresso-500">Entre com suas credenciais para gerenciar o ateliê.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-terracotta-600/20 bg-terracotta-600/5 px-4 py-2.5 text-sm text-terracotta-600">
              {error}
            </div>
          )}

          <div>
            <label className="label-field">E-mail</label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                placeholder="voce@atelie.com"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Senha</label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11 pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-md w-full">
            {loading ? 'Entrando...' : <>Entrar <ArrowRight size={16} /></>}
          </button>

        </form>
      </div>
      <Toaster />
    </div>
  )
}
