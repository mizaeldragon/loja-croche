import { HttpError, badRequest } from '../lib/http.js'
import { getShippingConfig } from './integrations.js'

// Documentação: https://docs.melhorenvio.com.br/
// Endpoint de cotação: POST /api/v2/me/shipment/calculate
// Unidades exigidas pela API: peso em KG, dimensões em CM.

const onlyDigits = (v) => String(v ?? '').replace(/\D/g, '')

export const normalizeZip = (zip) => {
  const digits = onlyDigits(zip)
  if (digits.length !== 8) throw badRequest('CEP inválido — informe 8 dígitos')
  return digits
}

const NAO_CONFIGURADO =
  'Cálculo de frete indisponível: configure o Melhor Envio em Configurações → Integrações.'

async function melhorEnvioFetch(config, path, options = {}) {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
      // A API do Melhor Envio exige um User-Agent identificável com e-mail de contato.
      'User-Agent': `Loja Croche (${config.contactEmail})`,
      ...options.headers,
    },
  })

  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!res.ok) {
    console.error('[melhor-envio] falha', res.status, body)

    // 401 e 403 têm causas diferentes e soluções diferentes. Tratar os dois
    // como "erro genérico" faz a lojista ficar tentando de novo sem saber o
    // que mudar.
    if (res.status === 401) {
      throw new HttpError(
        502,
        `Token do Melhor Envio recusado (modo: ${config.mode}). Ele pode ter expirado, ou ser de uma conta diferente do modo selecionado.`
      )
    }

    // 403 = o token é válido, mas foi gerado sem as permissões necessárias.
    // No painel do Melhor Envio as permissões são marcadas uma a uma na hora
    // de gerar, e é fácil gerar sem nenhuma.
    if (res.status === 403) {
      throw new HttpError(
        502,
        'O token do Melhor Envio não tem permissão para calcular frete. Gere um token novo marcando as permissões de envio (cotação/shipping) e cole aqui.'
      )
    }

    throw new HttpError(502, 'Não foi possível calcular o frete agora. Tente novamente.', {
      upstreamStatus: res.status,
    })
  }

  return body
}

/**
 * Cota o frete para um conjunto de itens.
 * @param {{ zip: string, items: Array<{ product: object, quantity: number, unitPriceCents: number }> }} params
 */
export async function quoteShipping({ zip, items }) {
  const config = await getShippingConfig()
  if (!config.configured) throw new HttpError(503, NAO_CONFIGURADO)

  const to = normalizeZip(zip)
  const from = normalizeZip(config.shipFromZip)

  if (!items.length) throw badRequest('Informe ao menos um item para calcular o frete')

  const products = items.map(({ product, quantity, unitPriceCents }) => ({
    id: product.id,
    width: Math.max(product.widthCm, 11),
    height: Math.max(product.heightCm, 2),
    length: Math.max(product.lengthCm, 16),
    // Gramas -> quilos, que é o que a API espera.
    weight: product.weightGrams / 1000,
    // Valor declarado: usado para o seguro do envio.
    insurance_value: unitPriceCents / 100,
    quantity,
  }))

  const raw = await melhorEnvioFetch(config, '/api/v2/me/shipment/calculate', {
    method: 'POST',
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products,
    }),
  })

  if (!Array.isArray(raw)) return []

  return raw
    // Serviços indisponíveis para a rota vêm com a chave `error` preenchida.
    .filter((s) => !s.error && s.price)
    .map((s) => ({
      id: String(s.id),
      tipo: 'transportadora',
      name: s.name,
      company: s.company?.name ?? '',
      carrier: [s.company?.name, s.name].filter(Boolean).join(' '),
      price: Number(s.price),
      // custom_delivery_time considera os dias extras configurados na conta.
      days: Number(s.custom_delivery_time ?? s.delivery_time ?? 0),
    }))
    .sort((a, b) => a.price - b.price)
}

/**
 * Valida as credenciais fazendo uma cotação de teste.
 *
 * Antes isso consultava /api/v2/me, que exige uma permissão DIFERENTE da que
 * o site usa. Dava para o teste passar e o frete continuar quebrado — ou, como
 * aconteceu, falhar sem explicar qual permissão faltava. Cotar é o que o site
 * faz de verdade, então é isso que o teste precisa exercitar. Não custa nada
 * e não posta nada.
 */
export async function testShippingCredentials() {
  const config = await getShippingConfig()

  if (!config.token) return { ok: false, message: 'Cole o token do Melhor Envio primeiro.' }
  if (config.shipFromZip.length !== 8) {
    return { ok: false, message: 'Informe o CEP de origem (8 dígitos).' }
  }

  const servicos = await melhorEnvioFetch(config, '/api/v2/me/shipment/calculate', {
    method: 'POST',
    body: JSON.stringify({
      from: { postal_code: config.shipFromZip },
      to: { postal_code: '01310100' }, // Av. Paulista, só para a cotação de teste
      products: [
        {
          id: 'teste',
          width: 16,
          height: 4,
          length: 20,
          weight: 0.3,
          insurance_value: 30,
          quantity: 1,
        },
      ],
    }),
  })

  const disponiveis = (Array.isArray(servicos) ? servicos : []).filter((s) => !s.error && s.price)

  if (!disponiveis.length) {
    return {
      ok: false,
      message:
        'O token funciona, mas nenhuma transportadora atendeu a cotação de teste. Confira se o CEP de origem está correto.',
    }
  }

  const nomes = disponiveis.slice(0, 3).map((s) => s.name).join(', ')
  return {
    ok: true,
    message: `Conectado! ${disponiveis.length} opções de envio disponíveis (${nomes}...).`,
  }
}
