import { useCatalogStore } from '../../store/useCatalogStore'
import { Reveal } from '../motion/Reveal'

export default function PromoBanner() {
  const promo = useCatalogStore((s) => s.banners.promo)
  if (!promo?.title) return null

  return (
    <div className="pb-20 pt-4 sm:pb-24 sm:pt-6">
      <div className="container-page">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl">
            <img src={promo.image} alt={promo.title} className="h-56 w-full object-cover sm:h-64" />
            <div className="absolute inset-0 flex items-center bg-gradient-to-r from-espresso-900/75 via-espresso-900/40 to-transparent">
              <div className="max-w-md px-8 sm:px-12">
                <h3 className="font-display text-2xl text-cream-50 sm:text-3xl">{promo.title}</h3>
                <p className="mt-2 text-sm text-cream-100/80 sm:text-base">{promo.subtitle}</p>
                {promo.ctaLabel && (
                  <a href={promo.ctaLink || '#contato'} className="btn-primary btn-md mt-6 inline-flex">
                    {promo.ctaLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
