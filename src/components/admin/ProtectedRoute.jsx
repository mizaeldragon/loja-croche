import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useCatalogStore } from '../../store/useCatalogStore'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const checking = useAuthStore((s) => s.checking)
  const restore = useAuthStore((s) => s.restore)
  const loadAdmin = useCatalogStore((s) => s.loadAdmin)

  // Revalida o token no servidor e, se valer, carrega os dados do painel.
  useEffect(() => {
    let active = true
    ;(async () => {
      const ok = await restore()
      if (ok && active) await loadAdmin().catch(() => {})
    })()
    return () => {
      active = false
    }
  }, [restore, loadAdmin])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50">
        <Loader2 size={32} className="animate-spin text-espresso-400" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
