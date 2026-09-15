import { create } from 'zustand'
import { api } from '../lib/api'
import { notifyError } from './useToastStore'

/**
 * Usuários do painel — agora a tabela `AdminUser` do banco, não uma lista
 * no localStorage. Senha nunca trafega de volta: o backend só recebe.
 * Todas as rotas exigem papel de administrador.
 */
export const useUserStore = create((set) => ({
  users: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    try {
      set({ users: await api.adminUsuarios(), loading: false })
    } catch (err) {
      set({ loading: false })
      // Editor não enxerga a lista: é 403 esperado, não vale alarmar.
      if (err.status !== 403) notifyError(err.message)
    }
  },

  addUser: async (data) => {
    const user = await api.criarUsuario(data)
    set((s) => ({ users: [...s.users, user] }))
    return user
  },

  updateUser: async (id, data) => {
    const user = await api.atualizarUsuario(id, data)
    set((s) => ({ users: s.users.map((u) => (u.id === id ? user : u)) }))
    return user
  },

  deleteUser: async (id) => {
    await api.excluirUsuario(id)
    set((s) => ({ users: s.users.filter((u) => u.id !== id) }))
  },
}))
