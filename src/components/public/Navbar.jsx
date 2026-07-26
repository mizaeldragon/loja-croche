import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import Logo from '../ui/Logo'
import { scrollToHash } from './ScrollToHash'
import clsx from 'clsx'

const LINKS = [
  { label: 'Início', to: '/', hash: '' },
  { label: 'Loja', to: '/loja' },
  { label: 'Sobre', to: '/#sobre', hash: 'sobre' },
  { label: 'Categorias', to: '/#categorias', hash: 'categorias' },
  { label: 'Depoimentos', to: '/#depoimentos', hash: 'depoimentos' },
  { label: 'FAQ', to: '/#faq', hash: 'faq' },
]

function isLinkActive(link, pathname, hash) {
  if (link.to === '/loja') return pathname.startsWith('/loja')
  if (link.hash) return pathname === '/' && hash === link.hash
  if (link.to === '/') return pathname === '/' && !hash
  return false
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const settings = useCatalogStore((s) => s.settings)
  const location = useLocation()
  const navigate = useNavigate()
  const hash = location.hash.replace('#', '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname, location.hash])

  const goTo = (e, link) => {
    // Loja: deixa o Link/Router cuidar
    if (link.to === '/loja') return

    e.preventDefault()
    setOpen(false)

    // Início: sobe a página
    if (link.to === '/' && !link.hash) {
      if (location.pathname !== '/') {
        navigate('/')
        requestAnimationFrame(() => scrollToHash('', { behavior: 'smooth' }))
      } else {
        window.history.replaceState(null, '', '/')
        scrollToHash('', { behavior: 'smooth' })
      }
      return
    }

    if (!link.hash) return

    const nextHash = `#${link.hash}`

    if (location.pathname !== '/') {
      navigate({ pathname: '/', hash: nextHash })
      return
    }

    // Já na home: atualiza hash e rola (mesmo se já estiver nesse hash)
    if (location.hash === nextHash) {
      scrollToHash(nextHash, { behavior: 'smooth' })
    } else {
      navigate({ pathname: '/', hash: nextHash })
      requestAnimationFrame(() => scrollToHash(nextHash, { behavior: 'smooth' }))
    }
  }

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-out',
        scrolled
          ? 'border-b border-espresso-700/[0.06] bg-cream-50/80 shadow-[0_8px_30px_-12px_rgb(61_43_32_/_0.12)] backdrop-blur-xl'
          : 'border-b border-transparent bg-cream-50/55 backdrop-blur-md'
      )}
    >
      <nav className="container-page grid h-[4.75rem] grid-cols-[auto_1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Logo
          to="/"
          name={settings.siteName}
          tagline={settings.tagline}
          className="min-w-0 justify-self-start"
          markClassName="h-11 w-11 rounded-2xl shadow-soft"
        />

        <div className="hidden justify-self-center lg:block">
          <div
            className={clsx(
              'flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500',
              scrolled ? 'bg-white/70 shadow-soft ring-1 ring-espresso-700/[0.06]' : 'bg-transparent'
            )}
          >
            {LINKS.map((l) => {
              const active = isLinkActive(l, location.pathname, hash)
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={(e) => goTo(e, l)}
                  className={clsx(
                    'relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide transition-all duration-300',
                    active
                      ? 'bg-espresso-700 text-cream-50 shadow-soft'
                      : 'text-espresso-600 hover:bg-espresso-700/[0.06] hover:text-espresso-800'
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hidden items-center justify-self-end gap-2.5 lg:flex">
          <Link to="/loja" className="btn-primary btn-sm">
            <ShoppingBag size={15} /> Ver coleção
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full bg-white/80 text-espresso-700 shadow-soft ring-1 ring-espresso-700/10 transition hover:bg-white lg:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={clsx(
          'overflow-hidden border-t border-espresso-700/8 bg-cream-50/95 backdrop-blur-xl transition-all duration-500 ease-out lg:hidden',
          open ? 'max-h-[28rem] opacity-100' : 'max-h-0 border-transparent opacity-0'
        )}
      >
        <div className="container-page flex flex-col gap-1 py-4">
          {LINKS.map((l) => {
            const active = isLinkActive(l, location.pathname, hash)
            return (
              <Link
                key={l.label}
                to={l.to}
                onClick={(e) => goTo(e, l)}
                className={clsx(
                  'rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-espresso-700 text-cream-50' : 'text-espresso-700 hover:bg-sand-50'
                )}
              >
                {l.label}
              </Link>
            )
          })}
          <Link to="/loja" className="btn-primary btn-md mt-3 w-full">
            <ShoppingBag size={16} /> Ver coleção
          </Link>
        </div>
      </div>
    </header>
  )
}
