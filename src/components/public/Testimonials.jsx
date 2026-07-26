import { Star, Quote } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import SectionHeading from './SectionHeading'
import { Stagger, StaggerItem } from '../motion/Reveal'

export default function Testimonials() {
  const testimonials = useCatalogStore((s) => s.testimonials)

  return (
    <section id="depoimentos" className="bg-sand-50/60 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Quem já vestiu, aprovou"
          title="Histórias de quem confia no ateliê"
          subtitle="A satisfação de cada cliente é o que move cada ponto do nosso trabalho."
        />
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <StaggerItem key={t.id} className="card-surface flex flex-col p-7">
              <Quote size={28} className="mb-4 text-terracotta-400" />
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={14} className="fill-gold-400 text-gold-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-espresso-600">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-espresso-700/8 pt-4">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-espresso-800">{t.name}</p>
                  <p className="text-xs text-espresso-400">{t.role}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
