import { create } from 'zustand'

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2)
    const item = { id, type: 'success', duration: 3200, ...toast }
    set((s) => ({ toasts: [...s.toasts, item] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, item.duration)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function notifySuccess(message) {
  useToastStore.getState().push({ type: 'success', message })
}
export function notifyError(message) {
  useToastStore.getState().push({ type: 'error', message })
}
export function notifyInfo(message) {
  useToastStore.getState().push({ type: 'info', message })
}
