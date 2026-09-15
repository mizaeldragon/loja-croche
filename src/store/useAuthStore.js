import { create } from 'zustand'
import { api, clearToken, getToken, setToken } from '../lib/api'

/**
 * Sessão do painel. Quem manda é o JWT emitido pelo backend — o estado aqui
 * é só um espelho para a UI. Nada de senha no navegador.
 */
export const useAuthStore = create((set) => ({
  currentUser: null,
  // Começa autenticado "otimisticamente" se existe token guardado; `restore()`
  // confirma com o servidor antes de liberar de fato.
  isAuthenticated: false,
  checking: Boolean(getToken()),

  login: async (email, password) => {
    try {
      const { token, user } = await api.login(email, password)
      setToken(token)
      set({ currentUser: user, isAuthenticated: true, checking: false })
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.message }
    }
  },

  /** Revalida o token guardado ao abrir o painel. */
  restore: async () => {
    if (!getToken()) {
      set({ checking: false, isAuthenticated: false, currentUser: null })
      return false
    }
    try {
      const user = await api.me()
      set({ currentUser: user, isAuthenticated: true, checking: false })
      return true
    } catch {
      clearToken()
      set({ currentUser: null, isAuthenticated: false, checking: false })
      return false
    }
  },

  logout: () => {
    clearToken()
    set({ currentUser: null, isAuthenticated: false, checking: false })
  },
}))
