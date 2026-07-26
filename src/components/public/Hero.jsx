import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import HeroCarousel from './HeroCarousel'
import { easeOut, scaleIn, staggerContainer, staggerItem } from '../../lib/motion'

export default function Hero() {
  const hero = useCatalogStore((s) => s.banners.hero)
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#FDD7CA_0%,_#FFF7F3_55%)]">
      <div className="pointer-events-none absolute inset-0 bg-grain" />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.15fr] lg:items-stretch lg:gap-10 lg:py-24">
        <motion.div
          className="order-2 flex flex-col justify-center lg:order-1"
          variants={reduce ? undefined : staggerContainer}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <motion.span variants={reduce ? undefined : staggerItem} className="eyebrow">
            <Sparkles size={13} /> {hero.eyebrow}
          </motion.span>
          <motion.h1
            variants={reduce ? undefined : staggerItem}
            className="mt-5 text-balance font-display text-4xl leading-[1.08] text-espresso-800 sm:text-5xl lg:text-[3.4rem]"
          >
            {hero.title}
          </motion.h1>
          <motion.p
            variants={reduce ? undefined : staggerItem}
            className="mt-6 max-w-lg text-balance text-[1.02rem] leading-relaxed text-espresso-500"
          >
            {hero.subtitle}
          </motion.p>
          <motion.div variants={reduce ? undefined : staggerItem} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={hero.primaryCtaLink || '/loja'} className="btn-primary btn-lg">
              {hero.primaryCta} <ArrowRight size={17} />
            </Link>
            <a href={hero.secondaryCtaLink || '#contato'} className="btn-secondary btn-lg">
              {hero.secondaryCta}
            </a>
          </motion.div>

          <motion.div
            variants={reduce ? undefined : staggerItem}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-espresso-700/8 pt-8"
          >
            <div className="flex items-center gap-2 text-sm text-espresso-500">
              <ShieldCheck size={17} className="text-espresso-700" /> Peças 100% artesanais
            </div>
            <div className="flex items-center gap-2 text-sm text-espresso-500">
              <Truck size={17} className="text-espresso-700" /> Envio para todo o Brasil
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative order-1 w-full max-w-xl justify-self-center lg:order-2 lg:max-w-none lg:justify-self-stretch"
          variants={reduce ? undefined : scaleIn}
          initial={reduce ? false : 'hidden'}
          animate={reduce ? undefined : 'show'}
          transition={{ delay: 0.15, duration: 0.8, ease: easeOut }}
        >
          <div className="relative aspect-[4/5] w-full lg:absolute lg:inset-0 lg:aspect-auto">
            <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-terracotta-400/30 to-sand-300/35 blur-2xl lg:-inset-4" />
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border-8 border-white shadow-lift">
              <motion.img
                src={hero.image}
                alt="Ateliê Angel Art Crochê"
                className="h-full w-full object-cover object-center"
                initial={reduce ? false : { scale: 1.08 }}
                animate={reduce ? undefined : { scale: 1 }}
                transition={{ duration: 1.2, ease: easeOut }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <HeroCarousel />
    </section>
  )
}
