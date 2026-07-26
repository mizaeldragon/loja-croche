import { Hand, Sparkles, PackageCheck, Gem, BadgeCheck, HeartHandshake } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { Reveal, Stagger, StaggerItem } from '../motion/Reveal'

const ICONS = [Hand, Sparkles, PackageCheck, Gem, BadgeCheck, HeartHandshake]

export default function Benefits() {
  const benefits = useCatalogStore((s) => s.settings.benefits)

  return (
    <section className="bg-white py-20 text-espresso-700 sm:py-24">
      <div className="container-page">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="eyebrow">Por que Angel Art</span>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-espresso-800 sm:text-4xl">
            O que você sente na peça
          </h2>
          <p className="mt-4 text-balance text-[0.95rem] leading-relaxed text-espresso-600/80">
            Mais do que crochê: capricho no acabamento, conversa próxima e o tempo certo de quem faz à mão.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <StaggerItem
                key={b.title}
                className="rounded-3xl border border-espresso-700/8 bg-cream-50 p-7 transition-colors hover:bg-sand-50"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-cream-50">
                  <Icon size={22} strokeWidth={1.7} />
                </div>
                <h3 className="font-display text-lg text-espresso-800">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-espresso-600/80">{b.desc}</p>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
