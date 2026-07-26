import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${widths[size]} max-h-[90vh] overflow-y-auto scrollbar-thin rounded-3xl bg-cream-50 shadow-lift animate-scaleIn`}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-espresso-700/8 bg-cream-50/95 px-6 py-4 backdrop-blur">
            <h3 className="font-display text-lg text-espresso-800">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-espresso-500 hover:bg-espresso-700/5"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
