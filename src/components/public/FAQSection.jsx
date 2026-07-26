import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import SectionHeading from './SectionHeading'
import { Stagger, StaggerItem } from '../motion/Reveal'
import { easeOut } from '../../lib/motion'

export default function FAQSection() {
  const faqs = useCatalogStore((s) => s.faqs)
  const [openId, setOpenId] = useState(faqs[0]?.id)

  return (
    <section id="faq" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#FDD7CA_0%,_#FFF7F3_55%)] py-20 sm:py-24">
      <div className="container-page mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Dúvidas frequentes"
          title="Tudo o que costumam perguntar"
          subtitle="Não achou sua resposta? Chame no WhatsApp ou envie uma mensagem — a gente responde com carinho."
        />
        <Stagger className="space-y-3">
          {faqs.map((f) => {
            const isOpen = openId === f.id
            return (
              <StaggerItem
                key={f.id}
                className={`overflow-hidden rounded-2xl border transition-colors ${
                  isOpen ? 'border-terracotta-400 bg-white' : 'border-espresso-700/8 bg-white/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-base text-espresso-800">{f.question}</span>
                  <Plus
                    size={18}
                    className={`shrink-0 text-terracotta-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-espresso-500">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
