import { Hand, Sparkles, PackageCheck, Gem, BadgeCheck, HeartHandshake } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { Reveal, Stagger, StaggerItem } from '../motion/Reveal'

const ICONS = [Hand, Sparkles, PackageCheck, Gem, BadgeCheck, HeartHandshake]

export default function Benefits() {
  const benefits = useCatalogStore((s) => s.settings.benefits)

  return (
    <section className="bg-espresso-800 py-20 text-cream-100 sm:py-24">
      <div className="container-page">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="eyebrow text-caramel-300">Por que escolher o ateliê</span>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-cream-50 sm:text-4xl">
            Diferenciais que você sente ao tocar
          </h2>
          <p className="mt-4 text-balance text-[0.95rem] leading-relaxed text-cream-100/65">
            Cada detalhe é pensado para entregar mais do que uma peça — uma experiência de exclusividade e cuidado.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <StaggerItem
                key={b.title}
                className="rounded-3xl border border-cream-100/10 bg-cream-100/[0.04] p-7 transition-colors hover:bg-cream-100/[0.07]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-caramel-400 to-gold-500 text-espresso-800">
                  <Icon size={22} strokeWidth={1.7} />
                </div>
                <h3 className="font-display text-lg text-cream-50">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-100/65">{b.desc}</p>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
