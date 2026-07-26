import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { formatCurrency } from '../../lib/format'
import { useCatalogStore } from '../../store/useCatalogStore'
import { staggerItem } from '../../lib/motion'

export default function ProductCard({ product }) {
  const categories = useCatalogStore((s) => s.categories)
  const category = categories.find((c) => c.slug === product.category)
  const hasPromo = product.promoPrice && product.promoPrice < product.price
  const reduce = useReducedMotion()

  return (
    <motion.div variants={reduce ? undefined : staggerItem}>
      <Link
        to={`/produto/${product.slug}`}
        className="group block overflow-hidden rounded-3xl border border-espresso-700/[0.06] bg-white transition-shadow duration-500 hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-sand-100">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="rounded-full bg-espresso-800/90 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-cream-50">
                Novidade
              </span>
            )}
            {product.bestseller && (
              <span className="rounded-full bg-gold-400/95 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-espresso-800">
                Mais vendido
              </span>
            )}
            {hasPromo && (
              <span className="rounded-full bg-terracotta-600/95 px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-cream-50">
                Oferta
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso-600 opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100 hover:text-terracotta-600"
            aria-label="Favoritar"
          >
            <Heart size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-espresso-900/70 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-xs font-semibold text-cream-50">Ver detalhes →</span>
          </div>
        </div>
        <div className="p-5">
          {category && (
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-terracotta-500">{category.name}</p>
          )}
          <h3 className="mt-1 line-clamp-1 font-display text-base text-espresso-800">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-espresso-400">{product.shortDescription}</p>
          <div className="mt-3 flex items-center gap-2">
            {hasPromo ? (
              <>
                <span className="font-display text-lg text-espresso-800">{formatCurrency(product.promoPrice)}</span>
                <span className="text-xs text-espresso-400 line-through">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="font-display text-lg text-espresso-800">{formatCurrency(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
