import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import SectionHeading from './SectionHeading'
import { Stagger, StaggerItem } from '../motion/Reveal'

export default function Categories() {
  const categories = useCatalogStore((s) => s.categories)
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div id="categorias" className="py-20 sm:pb-10 sm:pt-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Explore por categoria"
          title="Uma peça para cada momento"
          subtitle="Navegue pelas coleções do ateliê e encontre a peça perfeita para vestir, decorar ou presentear."
        />
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {sorted.map((c) => (
            <StaggerItem key={c.id}>
              <Link to={`/loja?categoria=${c.slug}`} className="group relative block overflow-hidden rounded-3xl">
                <div className="aspect-[4/5] w-full overflow-hidden sm:aspect-[4/3]">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/75 via-espresso-900/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <h3 className="font-display text-lg text-cream-50 sm:text-xl">{c.name}</h3>
                    <p className="mt-1 hidden max-w-[220px] text-xs text-cream-100/80 sm:block">{c.description}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-espresso-700 transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  )
}
