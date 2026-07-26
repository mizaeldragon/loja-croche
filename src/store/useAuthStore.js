import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useUserStore } from './useUserStore'

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (email, password) => {
        const users = useUserStore.getState().users
        const found = users.find(
          (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
        )
        if (!found) return { ok: false, message: 'E-mail ou senha inválidos.' }
        if (found.status !== 'ativo') return { ok: false, message: 'Este usuário está inativo.' }
        set({ currentUser: found, isAuthenticated: true })
        return { ok: true }
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'atelie-linha-e-ponto:auth' }
  )
)
