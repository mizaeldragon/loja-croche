import { Link } from 'react-router-dom'
import { Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import Logo from '../ui/Logo'
import WhatsAppIcon from '../ui/WhatsAppIcon'

export default function Footer() {
  const settings = useCatalogStore((s) => s.settings)
  const categories = useCatalogStore((s) => s.categories)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-espresso-700/10 bg-white text-espresso-700">
      <div className="container-page grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo to="/" name={settings.siteName} tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-espresso-600/80">{settings.footerText}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso-700/15 transition-colors hover:bg-sand-50"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso-700/15 transition-colors hover:bg-sand-50"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso-500">Categorias</h4>
          <ul className="mt-4 space-y-2.5">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/loja?categoria=${c.slug}`} className="text-sm text-espresso-600 hover:text-espresso-800">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso-500">Institucional</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-espresso-600">
            <li><Link to="/#sobre" className="hover:text-espresso-800">Sobre o ateliê</Link></li>
            <li><Link to="/#faq" className="hover:text-espresso-800">Perguntas frequentes</Link></li>
            <li><Link to="/#depoimentos" className="hover:text-espresso-800">Depoimentos</Link></li>
            <li><Link to="/#contato" className="hover:text-espresso-800">Política de entrega</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-espresso-500">Contato</h4>
          <ul className="mt-4 space-y-3 text-sm text-espresso-600">
            <li className="flex items-center gap-2"><Mail size={14} /> {settings.email}</li>
            <li className="flex items-center gap-2"><Phone size={14} /> {settings.phone}</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> {settings.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso-700/8 py-6">
        <p className="container-page text-center text-xs text-espresso-500">
          © {year} {settings.siteName}. Feito à mão, ponto a ponto.
        </p>
      </div>
    </footer>
  )
}
