import { useEffect, useState } from 'react'
import { api } from './api'

/**
 * Busca a simulação de parcelamento para uma lista de valores.
 *
 * Os valores são agrupados numa única chamada: uma listagem com 10 produtos
 * faz 1 requisição, não 10. O servidor ainda cacheia por valor.
 *
 * Falha aqui nunca é erro visível — se o Mercado Pago não estiver configurado
 * ou estiver fora, a vitrine simplesmente não mostra a linha de parcelas.
 * É informação de apoio; não vale quebrar a página por ela.
 */
export function useParcelas(valores) {
  const [mapa, setMapa] = useState({})

  // Serializa para o efeito não disparar a cada render por causa da
  // identidade do array.
  const chave = valores
    .filter((v) => Number.isFinite(v) && v > 0)
    .map((v) => Number(v).toFixed(2))
    .sort()
    .join(',')

  useEffect(() => {
    if (!chave) return

    let cancelado = false
    api
      .parcelas(chave.split(','))
      .then((r) => {
        if (!cancelado) setMapa(r ?? {})
      })
      .catch(() => {
        if (!cancelado) setMapa({})
      })

    return () => {
      cancelado = true
    }
  }, [chave])

  /** Devolve a simulação de um valor, ou null se não houver. */
  return (valor) => mapa[Number(valor).toFixed(2)] ?? null
}
