import { Reveal } from '../motion/Reveal'

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const isCenter = align === 'center'
  return (
    <Reveal className={`mx-auto mb-12 max-w-2xl ${isCenter ? 'text-center' : 'text-left'}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-espresso-800 sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-balance text-[0.95rem] leading-relaxed text-espresso-500">{subtitle}</p>}
    </Reveal>
  )
}
