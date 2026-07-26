import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  MessageSquareQuote,
  GalleryHorizontal,
  Settings,
  Users,
  ExternalLink,
  X,
} from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import Logo from '../ui/Logo'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/depoimentos', label: 'Depoimentos', icon: MessageSquareQuote },
  { to: '/admin/banners', label: 'Banners & Conteúdo', icon: GalleryHorizontal },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const siteName = useCatalogStore((s) => s.settings.siteName)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-espresso-900/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-espresso-700/8 bg-espresso-800 text-cream-100 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Logo
            to="/admin"
            name={siteName}
            tagline="Painel Admin"
            tone="dark"
          />
          <button onClick={onClose} className="text-cream-100/60 lg:hidden" aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin px-4 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-caramel-500 to-caramel-600 text-cream-50 shadow-soft'
                    : 'text-cream-100/70 hover:bg-cream-100/8 hover:text-cream-50'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-cream-100/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-cream-100/15 px-4 py-3 text-sm font-medium text-cream-100/80 transition-colors hover:bg-cream-100/8"
          >
            <ExternalLink size={15} /> Ver site publicado
          </a>
        </div>
      </aside>
    </>
  )
}
