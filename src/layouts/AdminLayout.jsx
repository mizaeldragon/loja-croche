import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import Topbar from '../components/admin/Topbar'
import Toaster from '../components/ui/Toaster'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [header, setHeader] = useState({ title: 'Dashboard', subtitle: '' })

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* min-w-0: item flex não encolhe abaixo do próprio conteúdo por padrão.
          Sem isso, qualquer página com conteúdo largo empurra a coluna inteira
          e o painel ganha rolagem horizontal no celular. */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
        <Topbar title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
          <div className="min-h-[calc(100vh-7rem)] rounded-3xl bg-[radial-gradient(ellipse_at_top_right,_#FDD7CA_0%,_#FFF7F3_55%)] p-5 sm:p-7">
            <Outlet context={{ setHeader }} />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
