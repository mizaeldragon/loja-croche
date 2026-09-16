import { HttpError } from '../lib/http.js'
import { getPaymentConfig } from './integrations.js'

/**
 * Simulação de parcelamento.
 *
 * Os juros NÃO são calculados aqui. Quem define a taxa é o Mercado Pago, e ela
 * muda por bandeira, por emissor e pela configuração da conta da lojista.
 * Qualquer fórmula nossa seria chute — e anunciar "6x de R$ 60" na vitrine e
 * oferecer outra coisa no checkout é condição não cumprida, que o Código de
 * Defesa do Consumidor trata como problema.
 *
 * Então perguntamos ao próprio Mercado Pago e repassamos a resposta dele.
 */

const MP_API = 'https://api.mercadopago.com'

// A vitrine consulta isso a cada listagem. Sem cache, uma página com 10
// produtos viraria 10 chamadas à API do MP a cada visita.
const TTL_MS = 30 * 60 * 1000
const cache = new Map()

const chaveCache = (centavos) => String(centavos)

function doCache(centavos) {
  const hit = cache.get(chaveCache(centavos))
  if (!hit) return null
  if (Date.now() - hit.em > TTL_MS) {
    cache.delete(chaveCache(centavos))
    return null
  }
  return hit.valor
}

export const limparCache = () => cache.clear()

/**
 * Normaliza a resposta do Mercado Pago.
 *
 * Exportada para poder ser testada com um payload real sem precisar de
 * credencial — é o pedaço com mais chance de quebrar se o MP mudar o formato.
 */
export function normalizarParcelas(resposta, valor) {
  // A API devolve um array por meio de pagamento; queremos o de cartão.
  const lista = Array.isArray(resposta) ? resposta : []
  const credito =
    lista.find((m) => m.payment_type_id === 'credit_card') ?? lista[0] ?? null

  const custos = credito?.payer_costs ?? []

  const opcoes = custos
    .map((c) => {
      const parcelas = Number(c.installments)
      const valorParcela = Number(c.installment_amount)
      const valorTotal = Number(c.total_amount ?? valorParcela * parcelas)
      // installment_rate vem 0 quando é sem juros.
      const temJuros = Number(c.installment_rate ?? 0) > 0

      if (!Number.isFinite(parcelas) || !Number.isFinite(valorParcela)) return null

      return {
        parcelas,
        valorParcela: Math.round(valorParcela * 100) / 100,
        valorTotal: Math.round(valorTotal * 100) / 100,
        temJuros,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.parcelas - b.parcelas)

  // O maior parcelamento sem juros é o que a vitrine destaca
  // ("ou até 6x de R$ 60 sem juros").
  const semJurosDisponiveis = opcoes.filter((o) => !o.temJuros && o.parcelas > 1)
  const maxSemJuros = semJurosDisponiveis.length
    ? semJurosDisponiveis[semJurosDisponiveis.length - 1]
    : null

  return { valor, opcoes, maxSemJuros }
}

async function consultarMP(accessToken, valor) {
  const url = `${MP_API}/v1/payment_methods/installments?amount=${valor}&locale=pt-BR`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })

  if (!res.ok) {
    const corpo = await res.text()
    console.error('[parcelas] Mercado Pago recusou', res.status, corpo.slice(0, 200))
    throw new HttpError(502, 'Não foi possível consultar as parcelas agora.')
  }

  return res.json()
}

/**
 * Simula o parcelamento para uma lista de valores (em reais).
 * Retorna um mapa { "360.00": { opcoes, maxSemJuros } }.
 *
 * Valores sem parcelamento disponível ou com falha na consulta voltam como
 * null: a vitrine simplesmente não mostra a linha de parcelas, em vez de
 * quebrar a página inteira por causa de um detalhe de exibição.
 */
export async function simularParcelas(valores) {
  const { accessToken, configured } = await getPaymentConfig()
  if (!configured) {
    throw new HttpError(
      503,
      'Parcelamento indisponível: configure o Mercado Pago em Integrações.'
    )
  }

  const unicos = [...new Set(valores.map((v) => Math.round(Number(v) * 100)))].filter(
    (c) => Number.isFinite(c) && c > 0
  )

  const resultado = {}

  await Promise.all(
    unicos.map(async (centavos) => {
      const valor = centavos / 100
      const chave = valor.toFixed(2)

      const emCache = doCache(centavos)
      if (emCache !== null) {
        resultado[chave] = emCache
        return
      }

      try {
        const bruto = await consultarMP(accessToken, valor)
        const normalizado = normalizarParcelas(bruto, valor)
        cache.set(chaveCache(centavos), { valor: normalizado, em: Date.now() })
        resultado[chave] = normalizado
      } catch (err) {
        console.error('[parcelas] falha para', valor, err.message)
        resultado[chave] = null
      }
    })
  )

  return resultado
}
