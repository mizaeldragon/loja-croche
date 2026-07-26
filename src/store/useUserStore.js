import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedUsers } from '../lib/seed'
import { uid } from '../lib/format'

export const useUserStore = create(
  persist(
    (set) => ({
      users: seedUsers,
      addUser: (data) =>
        set((s) => ({ users: [...s.users, { id: uid('user'), status: 'ativo', role: 'editor', ...data }] })),
      updateUser: (id, data) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    { name: 'atelie-linha-e-ponto:users' }
  )
)
