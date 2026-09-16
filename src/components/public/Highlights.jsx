import { Link } from 'react-router-dom'
import { ArrowRight, Package } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import ProductCard from './ProductCard'
import { useParcelas } from '../../lib/useParcelas'
import SectionHeading from './SectionHeading'
import EmptyState from '../ui/EmptyState'
import { Reveal, Stagger } from '../motion/Reveal'

export default function Highlights() {
  const products = useCatalogStore((s) => s.products)
  const featured = products.filter((p) => p.status === 'published' && p.featured).slice(0, 8)

  const precoDe = (p) => (p.promoPrice && p.promoPrice < p.price ? p.promoPrice : p.price)
  const parcelas = useParcelas(featured.map(precoDe))

  return (
    <section className="bg-white py-20 sm:py-24" id="destaques">
      <div className="container-page">
        <SectionHeading
          eyebrow="Seleção do ateliê"
          title="Peças que as clientes mais pedem"
          subtitle="Uma curadoria das criações queridinhas — delicadas, exclusivas e feitas para durar no dia a dia."
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
              <ProductCard key={p.id} product={p} parcelas={parcelas(precoDe(p))} />
            ))}
          </Stagger>
        )}
        <Reveal className="mt-12 text-center" delay={0.15}>
          <Link to="/loja" className="btn-secondary btn-md bg-white hover:bg-white">
            Ver toda a coleção <ArrowRight size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
