import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { Reveal } from '../motion/Reveal'
import { easeOut } from '../../lib/motion'

const INTERVAL_MS = 4500

export default function HeroCarousel() {
  const slides = useCatalogStore((s) => s.banners.carousel) || []
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  const count = slides.length

  useEffect(() => {
    if (count < 2 || paused) return undefined
    const id = setInterval(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % count)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [count, paused])

  if (!count) return null

  const go = (next) => {
    const target = (next + count) % count
    setDirection(target > index || (index === count - 1 && target === 0) ? 1 : -1)
    setIndex(target)
  }

  const slide = slides[index]
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '8%' : '-8%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-8%' : '8%', opacity: 0 }),
  }

  return (
    <Reveal className="container-page relative pb-12 sm:pb-16" delay={0.2}>
      <div
        className="relative overflow-hidden rounded-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-52 sm:h-64 lg:h-72">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: easeOut }}
              className="absolute inset-0"
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-espresso-900/75 via-espresso-900/35 to-transparent">
                <div className="max-w-md px-8 sm:px-12">
                  <h3 className="font-display text-2xl text-cream-50 sm:text-3xl">{slide.title}</h3>
                  {slide.subtitle && (
                    <p className="mt-2 text-sm text-cream-100/80 sm:text-base">{slide.subtitle}</p>
                  )}
                  {slide.ctaLabel && (
                    <Link to={slide.ctaLink || '/loja'} className="btn-primary btn-md mt-5 inline-flex">
                      {slide.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Slide anterior"
          onClick={() => go(index - 1)}
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-espresso-700 shadow-card backdrop-blur transition hover:bg-white sm:left-4"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Próximo slide"
          onClick={() => go(index + 1)}
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-espresso-700 shadow-card backdrop-blur transition hover:bg-white sm:right-4"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-7 bg-gold-300' : 'w-2 bg-white/55 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Slide {index + 1} de {count}: {slide?.title}
      </span>
    </Reveal>
  )
}
