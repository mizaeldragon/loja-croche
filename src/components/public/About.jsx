import { Sparkles } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { Reveal, Stagger, StaggerItem } from '../motion/Reveal'

export default function About() {
  const settings = useCatalogStore((s) => s.settings)

  return (
    <section id="sobre" className="bg-sand-50/60 py-20 sm:py-24">
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <span className="eyebrow">
            <Sparkles size={13} /> Sobre o ateliê
          </span>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-espresso-800 sm:text-4xl">
            {settings.aboutTitle}
          </h2>
          <p className="mt-6 text-balance text-[0.98rem] leading-relaxed text-espresso-500">{settings.aboutText}</p>

          <Stagger className="mt-10 grid grid-cols-3 gap-4 border-t border-espresso-700/8 pt-8">
            {settings.aboutHighlights.map((h) => (
              <StaggerItem key={h.label}>
                <p className="font-display text-2xl text-espresso-800 sm:text-3xl">{h.value}</p>
                <p className="mt-1 text-xs text-espresso-500 sm:text-sm">{h.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        <Reveal className="order-1 lg:order-2" variant="scale" delay={0.1}>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-terracotta-400/25 to-sand-300/40 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border-8 border-white shadow-lift">
              <img src={settings.aboutImage} alt="Ateliê de crochê" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
