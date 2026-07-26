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
    <footer className="border-t border-espresso-700/8 bg-espresso-800 text-cream-100">
      <div className="container-page grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo to="/" name={settings.siteName} tone="dark" />
          <p className="mt-4 text-sm leading-relaxed text-cream-100/65">{settings.footerText}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-100/15 transition-colors hover:bg-cream-100/10"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-100/15 transition-colors hover:bg-cream-100/10"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-100/50">Categorias</h4>
          <ul className="mt-4 space-y-2.5">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link to={`/loja?categoria=${c.slug}`} className="text-sm text-cream-100/75 hover:text-cream-50">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-100/50">Institucional</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-cream-100/75">
            <li><Link to="/#sobre" className="hover:text-cream-50">Sobre o ateliê</Link></li>
            <li><Link to="/#faq" className="hover:text-cream-50">Perguntas frequentes</Link></li>
            <li><Link to="/#depoimentos" className="hover:text-cream-50">Depoimentos</Link></li>
            <li><Link to="/#contato" className="hover:text-cream-50">Política de entrega</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cream-100/50">Contato</h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/75">
            <li className="flex items-center gap-2"><Mail size={14} /> {settings.email}</li>
            <li className="flex items-center gap-2"><Phone size={14} /> {settings.phone}</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> {settings.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/10 py-6">
        <p className="container-page text-center text-xs text-cream-100/45">
          © {year} {settings.siteName}. Todos os direitos reservados. Feito à mão, com carinho.
        </p>
      </div>
    </footer>
  )
}
