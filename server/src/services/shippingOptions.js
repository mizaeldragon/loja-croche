import { HttpError } from '../lib/http.js'
import { getShippingConfig } from './integrations.js'
import { localOptions } from './localDelivery.js'
import { quoteShipping } from './melhorEnvio.js'

/**
 * Lista única de opções de entrega: as locais da lojista + as transportadoras.
 *
 * Esta é a ÚNICA fonte de opções de frete do sistema. O checkout recota por
 * aqui e confere se a opção escolhida existe nesta lista — é o que impede
 * alguém de mandar um id inventado e não pagar frete. Qualquer opção nova
 * precisa nascer aqui, ou fica de fora dessa proteção.
 *
 * As duas fontes são independentes de propósito: uma loja que só entrega na
 * própria cidade tem que funcionar sem Melhor Envio nenhum, e uma falha da
 * transportadora não pode esconder a entrega local (nem o contrário).
 */
export async function getShippingOptions({ zip, items }) {
  const locais = await localOptions({ zip })

  let transportadoras = []
  let erroTransportadora = null

  const config = await getShippingConfig()
  if (config.configured) {
    try {
      transportadoras = await quoteShipping({ zip, items })
    } catch (err) {
      // Guardamos o erro: só vira problema do cliente se não houver
      // nenhuma outra opção de entrega.
      erroTransportadora = err
      console.error('[frete] transportadoras indisponíveis:', err.message)
    }
  }

  const todas = [...locais, ...transportadoras]

  if (todas.length === 0) {
    // Sem nada para oferecer: aí sim o erro precisa aparecer, e o da
    // transportadora explica melhor do que uma mensagem genérica.
    if (erroTransportadora) throw erroTransportadora
    throw new HttpError(
      503,
      'Nenhuma forma de entrega disponível. Configure a entrega local ou o Melhor Envio em Integrações.'
    )
  }

  // Locais primeiro (são mais baratas e rápidas para quem é da cidade), e
  // dentro de cada grupo, da mais barata para a mais cara.
  const peso = (o) => (o.tipo === 'retirada' ? 0 : o.tipo === 'local' ? 1 : 2)

  return todas.sort((a, b) => peso(a) - peso(b) || a.price - b.price)
}
