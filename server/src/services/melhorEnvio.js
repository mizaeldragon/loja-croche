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

    // 401 quase sempre é token expirado ou token de sandbox usado em produção
    // (e vice-versa). Vale dizer isso em vez de um "erro genérico".
    if (res.status === 401) {
      throw new HttpError(
        502,
        `Token do Melhor Envio recusado (modo: ${config.mode}). Ele pode ter expirado, ou ser de uma conta diferente do modo selecionado.`
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
 * Valida as credenciais sem fazer uma venda: consulta os dados da conta.
 * Usado pelo botão "Testar conexão" do painel.
 */
export async function testShippingCredentials() {
  const config = await getShippingConfig()

  if (!config.token) return { ok: false, message: 'Cole o token do Melhor Envio primeiro.' }
  if (config.shipFromZip.length !== 8) {
    return { ok: false, message: 'Informe o CEP de origem (8 dígitos).' }
  }

  const me = await melhorEnvioFetch(config, '/api/v2/me')
  return {
    ok: true,
    message: `Conectado como ${me.firstname ?? me.email ?? 'conta Melhor Envio'} (modo ${config.mode}).`,
  }
}
