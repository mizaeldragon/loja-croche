import { motion } from 'framer-motion'
import { useCatalogStore } from '../../store/useCatalogStore'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import { easeOut } from '../../lib/motion'

export default function WhatsAppButton() {
  const whatsapp = useCatalogStore((s) => s.settings.whatsapp)
  return (
    <motion.a
      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações sobre as peças de crochê 💛')}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift sm:bottom-7 sm:right-7"
      aria-label="Falar no WhatsApp"
      initial={{ opacity: 0, scale: 0.7, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, ease: easeOut }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
    >
      <WhatsAppIcon size={30} />
    </motion.a>
  )
}
