import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const HEADER_OFFSET = 88

/** Rola suavemente até o elemento do hash, considerando o header sticky. */
export function scrollToHash(hash, { behavior = 'smooth' } = {}) {
  const id = (hash || '').replace(/^#/, '')
  if (!id) {
    window.scrollTo({ top: 0, behavior })
    return
  }

  const el = document.getElementById(id)
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior })
}

/** Escuta mudanças de hash (e entrada na página) e faz o scroll. */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    // Aguarda o layout/paint (útil ao vir de outra rota)
    const t1 = window.setTimeout(() => scrollToHash(hash, { behavior: 'smooth' }), 40)
    const t2 = window.setTimeout(() => scrollToHash(hash, { behavior: 'smooth' }), 220)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [pathname, hash])

  return null
}
