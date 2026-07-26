import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import Topbar from '../components/admin/Topbar'
import Toaster from '../components/ui/Toaster'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [header, setHeader] = useState({ title: 'Dashboard', subtitle: '' })

  return (
    <div className="flex min-h-screen bg-sand-50/50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar title={header.title} subtitle={header.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <Outlet context={{ setHeader }} />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
