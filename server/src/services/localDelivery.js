import { prisma } from '../lib/prisma.js'
import { toCents } from '../lib/money.js'
import { getShippingConfig } from './integrations.js'

/**
 * Entrega local: as opções que a própria lojista entrega, sem transportadora.
 *
 * Existe porque transportadora para a mesma cidade é cara e lenta — um produto
 * de R$ 20 sai por R$ 12,43 em 3 dias, sendo que ela leva em mãos no mesmo dia.
 * Sem essa opção, o cliente da cidade abandona o carrinho e fecha pelo
 * WhatsApp, e a venda some do sistema.
 */

// O CEP do comprador vira cidade pelo ViaCEP. Cache porque a mesma cidade
// se repete muito e a cotação é consultada a cada mudança no carrinho.
const TTL_MS = 24 * 60 * 60 * 1000
const cacheCidade = new Map()

export const limparCacheCidade = () => cacheCidade.clear()

/** Normaliza para comparar cidade sem depender de acento ou caixa. */
const chaveCidade = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

/**
 * Resolve o CEP em { city, state }.
 * Devolve null se não der — e nesse caso simplesmente não oferecemos entrega
 * local, em vez de derrubar a cotação inteira.
 */
export async function resolverCidade(cep) {
  const digitos = String(cep ?? '').replace(/\D/g, '')
  if (digitos.length !== 8) return null

  const hit = cacheCidade.get(digitos)
  if (hit && Date.now() - hit.em < TTL_MS) return hit.valor

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
    if (!res.ok) return null

    const data = await res.json()
    if (data.erro) return null

    const valor = { city: data.localidade ?? '', state: data.uf ?? '' }
    cacheCidade.set(digitos, { valor, em: Date.now() })
    return valor
  } catch {
    return null
  }
}

export async function getDeliverySettings() {
  const row = await prisma.deliverySettings.findUnique({ where: { id: 'default' } })
  return (
    row ?? {
      localCity: null,
      localState: null,
      localEnabled: false,
      localLabel: 'Entrega local',
      localPrice: 0,
      localDays: 2,
      pickupEnabled: false,
      pickupLabel: 'Retirada combinada',
      pickupInstructions: null,
    }
  )
}

export async function saveDeliverySettings(input) {
  const data = {}
  const campos = [
    'localCity',
    'localState',
    'localEnabled',
    'localLabel',
    'localDays',
    'pickupEnabled',
    'pickupLabel',
    'pickupInstructions',
  ]
  for (const c of campos) if (input[c] !== undefined) data[c] = input[c]
  if (input.localPrice !== undefined) data.localPrice = input.localPrice
  if (input.localState !== undefined) {
    data.localState = input.localState ? input.localState.toUpperCase() : null
  }

  return prisma.deliverySettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  })
}

/**
 * Monta as opções locais para um CEP de destino.
 *
 * Retorna [] quando o CEP não é da cidade atendida, quando nada está ativado,
 * ou quando o ViaCEP não respondeu. Nunca lança: falha aqui não pode impedir
 * o cliente de ver as transportadoras.
 *
 * Os ids têm prefixo `local:` / `retirada:` para não colidirem com os ids
 * numéricos que o Melhor Envio usa.
 */
export async function localOptions({ zip }) {
  try {
    const cfg = await getDeliverySettings()
    if (!cfg.localEnabled && !cfg.pickupEnabled) return []

    // A cidade atendida NÃO é digitada: sai do CEP de origem que a lojista já
    // configurou. Digitar abria espaço para typo e acento errado, e o efeito
    // era silencioso — nenhuma opção aparecia e nada explicava o motivo.
    const { shipFromZip } = await getShippingConfig()
    if (!shipFromZip) return []

    const [origem, destino] = await Promise.all([
      resolverCidade(shipFromZip),
      resolverCidade(zip),
    ])
    if (!origem || !destino) return []

    const mesmaCidade =
      chaveCidade(origem.city) === chaveCidade(destino.city) &&
      chaveCidade(origem.state) === chaveCidade(destino.state)

    if (!mesmaCidade) return []

    const opcoes = []

    if (cfg.pickupEnabled) {
      opcoes.push({
        id: 'retirada:combinada',
        tipo: 'retirada',
        name: cfg.pickupLabel,
        company: '',
        carrier: cfg.pickupLabel,
        price: 0,
        days: 0,
        // A lojista combina onde e como; mostramos isso depois da compra.
        observacao: cfg.pickupInstructions ?? null,
      })
    }

    if (cfg.localEnabled) {
      opcoes.push({
        id: 'local:cidade',
        tipo: 'local',
        name: cfg.localLabel,
        company: '',
        carrier: cfg.localLabel,
        price: toCents(cfg.localPrice) / 100,
        days: cfg.localDays,
        observacao: null,
      })
    }

    return opcoes
  } catch (err) {
    console.error('[entrega-local] falhou, seguindo só com transportadoras:', err.message)
    return []
  }
}

/** Cidade atendida, derivada do CEP de origem — para exibir no painel. */
export async function cidadeAtendida() {
  const { shipFromZip } = await getShippingConfig()
  if (!shipFromZip) return null
  return resolverCidade(shipFromZip)
}
