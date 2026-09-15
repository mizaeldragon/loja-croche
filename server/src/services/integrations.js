import { prisma } from '../lib/prisma.js'
import { decrypt, encrypt, mask } from '../lib/crypto.js'

/**
 * Configuração das integrações da loja, lida do banco.
 *
 * Como os valores mudam em runtime (a lojista salva pelo painel), nada aqui
 * pode ser resolvido no boot. Guardamos um cache curto só para não bater no
 * banco a cada cotação de frete — e o cache é invalidado ao salvar.
 */

const URLS = {
  melhorEnvio: {
    sandbox: 'https://sandbox.melhorenvio.com.br',
    production: 'https://melhorenvio.com.br',
  },
}

let cache = null

export const invalidateCache = () => {
  cache = null
}

async function load() {
  if (cache) return cache

  const row = await prisma.integration.findUnique({ where: { id: 'default' } })
  cache = row ?? {
    mpAccessToken: null,
    meToken: null,
    meMode: 'sandbox',
    meContactEmail: null,
    shipFromZip: null,
  }
  return cache
}

/** Credenciais do Mercado Pago já decifradas. */
export async function getPaymentConfig() {
  const c = await load()
  const accessToken = decrypt(c.mpAccessToken)

  return {
    accessToken,
    configured: Boolean(accessToken),
  }
}

/** Credenciais do Melhor Envio já decifradas. */
export async function getShippingConfig() {
  const c = await load()
  const token = decrypt(c.meToken)
  const zip = (c.shipFromZip ?? '').replace(/\D/g, '')

  return {
    token,
    baseUrl: URLS.melhorEnvio[c.meMode] ?? URLS.melhorEnvio.sandbox,
    contactEmail: c.meContactEmail ?? '',
    shipFromZip: zip,
    mode: c.meMode,
    // Sem CEP de origem não há de onde cotar: a integração não está pronta.
    configured: Boolean(token && zip.length === 8),
  }
}

/** Estado das integrações para o painel — sem jamais devolver o segredo. */
export async function getStatus() {
  const c = await load()
  const mpToken = decrypt(c.mpAccessToken)
  const meToken = decrypt(c.meToken)

  return {
    mercadoPago: {
      configured: Boolean(mpToken),
      accessTokenMasked: mask(mpToken),
    },
    melhorEnvio: {
      configured: Boolean(meToken),
      tokenMasked: mask(meToken),
      mode: c.meMode,
      contactEmail: c.meContactEmail ?? '',
      shipFromZip: c.shipFromZip ?? '',
    },
    updatedAt: c.updatedAt ?? null,
  }
}

/**
 * Salva o que veio do painel.
 *
 * Campo ausente = não mexe. Campo com string vazia = apagar de propósito.
 * Isso permite salvar o CEP sem ter que recolar o token toda vez.
 */
export async function saveConfig(input) {
  const data = {}

  const setSecret = (campo, valor) => {
    if (valor === undefined) return
    data[campo] = valor === '' ? null : encrypt(valor)
  }

  setSecret('mpAccessToken', input.mpAccessToken)
  setSecret('meToken', input.meToken)

  if (input.meMode !== undefined) data.meMode = input.meMode
  if (input.meContactEmail !== undefined) data.meContactEmail = input.meContactEmail || null
  if (input.shipFromZip !== undefined) {
    data.shipFromZip = input.shipFromZip ? input.shipFromZip.replace(/\D/g, '') : null
  }

  await prisma.integration.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  })

  invalidateCache()
  return getStatus()
}
