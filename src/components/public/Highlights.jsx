import { Link } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import ProductCard from './ProductCard'
import SectionHeading from './SectionHeading'
import EmptyState from '../ui/EmptyState'
import { Reveal, Stagger } from '../motion/Reveal'

export default function Highlights() {
  const products = useCatalogStore((s) => s.products)
  const featured = products.filter((p) => p.status === 'published' && p.featured).slice(0, 8)

  return (
    <section className="py-20 sm:py-24" id="destaques">
      <div className="container-page">
        <SectionHeading
          eyebrow="Seleção especial"
          title="Peças em destaque"
          subtitle="Uma curadoria das criações mais amadas do ateliê — exclusivas, delicadas e feitas para durar."
        />
        {featured.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum destaque publicado"
            description="Assim que produtos forem marcados como destaque, eles aparecem aqui."
          />
        ) : (
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        )}
        <Reveal className="mt-12 text-center" delay={0.15}>
          <Link to="/loja" className="btn-secondary btn-md">
            Ver coleção completa <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
