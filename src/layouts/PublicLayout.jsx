import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Navbar from '../components/public/Navbar'
import Footer from '../components/public/Footer'
import WhatsAppButton from '../components/public/WhatsAppButton'
import ScrollToHash from '../components/public/ScrollToHash'
import Toaster from '../components/ui/Toaster'
import { useCatalogStore } from '../store/useCatalogStore'

export default function PublicLayout() {
  const load = useCatalogStore((s) => s.load)
  const error = useCatalogStore((s) => s.error)

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-screen bg-cream-100">
      <ScrollToHash />

      {/* Sem a API o site cai no conteúdo de exemplo: preços e estoque podem
          estar desatualizados, então isso precisa ficar visível. */}
      {error && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            Não conseguimos carregar o catálogo agora ({error}). O conteúdo abaixo pode estar
            desatualizado.
          </span>
        </div>
      )}

      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <Toaster />
    </div>
  )
}
