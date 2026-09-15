import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { api } from '../../lib/api'
import { formatCurrency } from '../../lib/format'

const VISUAL = {
  sucesso: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    title: 'Pagamento confirmado!',
    text: 'Recebemos seu pedido. Em instantes você recebe a confirmação por e-mail e já começamos a preparar sua peça.',
  },
  pendente: {
    icon: Clock,
    color: 'text-amber-600',
    title: 'Pagamento em processamento',
    text: 'Seu pedido foi registrado e estamos aguardando a confirmação do pagamento. Boleto pode levar até 3 dias úteis; PIX costuma cair em minutos.',
  },
  falha: {
    icon: AlertCircle,
    color: 'text-red-600',
    title: 'O pagamento não foi concluído',
    text: 'Nada foi cobrado. Seus itens continuam no carrinho — você pode tentar de novo com outra forma de pagamento.',
  },
}

export default function OrderStatus() {
  const { resultado } = useParams()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('ref')
  const clearCart = useCartStore((s) => s.clear)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(Boolean(orderId))
  const cleared = useRef(false)

  const visual = VISUAL[resultado] ?? VISUAL.pendente
  const Icon = visual.icon

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    if (!orderId) return

    let cancelled = false
    let attempts = 0

    // O webhook do Mercado Pago pode chegar segundos depois do redirect,
    // então consultamos algumas vezes antes de desistir.
    async function poll() {
      try {
        const data = await api.statusPedido(orderId)
        if (cancelled) return

        setOrder(data)
        setLoading(false)

        // Só limpa o carrinho quando o pagamento realmente entrou.
        if (data.paymentStatus === 'pago' && !cleared.current) {
          cleared.current = true
          clearCart()
        }

        if (data.paymentStatus === 'pendente' && resultado === 'sucesso' && attempts < 5) {
          attempts += 1
          setTimeout(poll, 2000)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    poll()
    return () => {
      cancelled = true
    }
  }, [orderId, resultado, clearCart])

  return (
    <div className="bg-white py-20">
      <div className="container-page max-w-xl text-center">
        {loading ? (
          <Loader2 size={40} className="mx-auto animate-spin text-espresso-400" />
        ) : (
          <Icon size={48} className={`mx-auto ${visual.color}`} />
        )}

        <h1 className="mt-6 font-display text-3xl text-espresso-800">{visual.title}</h1>
        <p className="mt-3 text-espresso-500">{visual.text}</p>

        {order && (
          <dl className="mt-8 space-y-2 rounded-2xl border border-espresso-700/10 bg-sand-50 p-5 text-left text-sm">
            <div className="flex justify-between">
              <dt className="text-espresso-500">Pedido</dt>
              <dd className="font-medium text-espresso-800">#{order.number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-espresso-500">Total</dt>
              <dd className="font-medium text-espresso-800">{formatCurrency(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-espresso-500">Pagamento</dt>
              <dd className="font-medium capitalize text-espresso-800">{order.paymentStatus}</dd>
            </div>
          </dl>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/loja" className="btn-primary btn-md">
            Continuar comprando
          </Link>
          {resultado === 'falha' && (
            <Link to="/carrinho" className="btn-secondary btn-md">
              Voltar ao carrinho
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
