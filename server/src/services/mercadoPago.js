import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'
import { env } from '../lib/env.js'
import { HttpError } from '../lib/http.js'
import { fromCents } from '../lib/money.js'
import { getPaymentConfig } from './integrations.js'

const NAO_CONFIGURADO =
  'Pagamentos indisponíveis: configure o Mercado Pago em Configurações → Integrações.'

async function client() {
  const config = await getPaymentConfig()
  if (!config.configured) throw new HttpError(503, NAO_CONFIGURADO)
  return { sdk: new MercadoPagoConfig({ accessToken: config.accessToken }), config }
}

/**
 * Cria a preference (checkout) no Mercado Pago.
 * Os valores vêm SEMPRE do servidor — nunca do payload do cliente.
 */
export async function createPreference({ order, items, shippingCents, customer, apiBaseUrl }) {
  const { sdk, config } = await client()
  const preference = new Preference(sdk)

  const body = {
    external_reference: order.id,
    items: items.map((i) => ({
      id: i.productId,
      title: i.productName,
      quantity: i.quantity,
      unit_price: fromCents(i.unitPriceCents),
      currency_id: 'BRL',
    })),
    // O frete entra como linha própria para o comprador ver o detalhamento.
    shipments: {
      cost: fromCents(shippingCents),
      mode: 'not_specified',
    },
    payer: {
      name: customer.name,
      email: customer.email,
      ...(customer.document
        ? { identification: { type: 'CPF', number: customer.document } }
        : {}),
    },
    back_urls: {
      success: `${env.PUBLIC_SITE_URL}/pedido/sucesso?ref=${order.id}`,
      pending: `${env.PUBLIC_SITE_URL}/pedido/pendente?ref=${order.id}`,
      failure: `${env.PUBLIC_SITE_URL}/pedido/falha?ref=${order.id}`,
    },
    auto_return: 'approved',
    notification_url: `${apiBaseUrl}/api/webhooks/mercadopago`,
  }

  const result = await preference.create({ body })

  return {
    preferenceId: result.id,
    // Checkout real. É nele que o cliente escolhe PIX, débito, crédito ou
    // boleto — não precisamos listar meio de pagamento nenhum aqui.
    checkoutUrl: result.init_point,
  }
}

export async function getPayment(paymentId) {
  const { sdk } = await client()
  return new Payment(sdk).get({ id: paymentId })
}

// Mapeia o status do MP para o nosso enum PaymentStatus.
export function mapPaymentStatus(mpStatus) {
  switch (mpStatus) {
    case 'approved':
      return 'pago'
    case 'rejected':
    case 'cancelled':
      return 'recusado'
    case 'refunded':
    case 'charged_back':
      return 'estornado'
    default:
      return 'pendente'
  }
}

/**
 * Valida o access token sem cobrar ninguém: cria uma preference de teste.
 * Preference não gera cobrança — só um link de checkout que ninguém vai abrir.
 */
export async function testPaymentCredentials() {
  const config = await getPaymentConfig()
  if (!config.configured) return { ok: false, message: 'Cole o Access Token primeiro.' }

  const { sdk } = await client()

  try {
    await new Preference(sdk).create({
      body: {
        items: [{ title: 'Teste de conexão', quantity: 1, unit_price: 1, currency_id: 'BRL' }],
      },
    })
  } catch (err) {
    // O SDK devolve mensagens técnicas ("At least one policy returned
    // UNAUTHORIZED"). Quem lê isso é a lojista, não um programador.
    const status = err.status ?? err.statusCode
    if (status === 401 || status === 403) {
      return {
        ok: false,
        message:
          'Access Token recusado. Confira se copiou o token inteiro e se ele veio de "Credenciais de produção".',
      }
    }
    return { ok: false, message: `Erro ao falar com o Mercado Pago: ${err.message}` }
  }

  return {
    ok: true,
    message: 'Conectado! Sua loja já pode receber por PIX, cartão de débito, crédito e boleto.',
  }
}
