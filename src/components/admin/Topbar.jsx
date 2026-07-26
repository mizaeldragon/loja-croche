import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const [open, setOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-espresso-600 hover:bg-sand-100 lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div>
          <h1 className="font-display text-xl text-espresso-800 sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-xs text-espresso-400 sm:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-full border border-espresso-700/10 bg-white py-1.5 pl-1.5 pr-3 shadow-soft"
        >
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="hidden text-sm font-medium text-espresso-700 sm:inline">{currentUser?.name}</span>
          <ChevronDown size={14} className="text-espresso-400" />
        </button>
        {open && (
          <div className="absolute right-0 top-full z-40 mt-2 w-48 animate-fadeUp overflow-hidden rounded-2xl border border-espresso-700/8 bg-white py-1.5 shadow-lift">
            <div className="px-4 py-2 text-xs text-espresso-400">
              Logado como <br />
              <span className="font-semibold text-espresso-700">{currentUser?.email}</span>
            </div>
            <button
              onClick={() => navigate('/admin/configuracoes')}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-espresso-600 hover:bg-sand-50"
            >
              <User size={15} /> Meu perfil
            </button>
            <button
              onClick={() => {
                logout()
                navigate('/admin/login')
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-terracotta-600 hover:bg-sand-50"
            >
              <LogOut size={15} /> Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
