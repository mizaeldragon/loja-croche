import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { formatCurrency } from '../../lib/format'
import ShippingCalculator from '../../components/public/ShippingCalculator'
import Parcelamento from '../../components/public/Parcelamento'
import { useParcelas } from '../../lib/useParcelas'
import EmptyState from '../../components/ui/EmptyState'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, zip, setZip, shipping, setShipping, toApiItems } =
    useCartStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal + (shipping?.price ?? 0)

  // Simula sobre o total já com frete: é exatamente o valor que vai para o
  // Mercado Pago, então o que aparece aqui bate com a tela de pagamento.
  const parcelas = useParcelas([total])

  if (!items.length) {
    return (
      <div className="bg-white py-24">
        <div className="container-page">
          <EmptyState
            icon={ShoppingBag}
            title="Seu carrinho está vazio"
            description="Escolha uma peça na loja para começar."
            action={
              <Link to="/loja" className="btn-primary btn-sm">
                Ver a loja
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="container-page">
        <h1 className="font-display text-3xl text-espresso-800 sm:text-4xl">Seu carrinho</h1>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex gap-4 rounded-2xl border border-espresso-700/10 bg-white p-4"
              >
                <Link to={`/produto/${item.slug}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    to={`/produto/${item.slug}`}
                    className="font-medium text-espresso-800 hover:text-terracotta-600"
                  >
                    {item.name}
                  </Link>
                  {(item.color || item.size) && (
                    <p className="mt-0.5 text-xs text-espresso-500">
                      {[item.color, item.size].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-1 rounded-xl border border-espresso-700/12">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="p-2 text-espresso-600 hover:text-espresso-900"
                        aria-label={`Diminuir quantidade de ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="p-2 text-espresso-600 hover:text-espresso-900"
                        aria-label={`Aumentar quantidade de ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="font-display text-lg text-espresso-800">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.key)}
                  className="self-start p-1.5 text-espresso-400 hover:text-red-600"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <ShippingCalculator
              items={toApiItems()}
              zip={zip}
              onZipChange={setZip}
              selected={shipping}
              onSelect={setShipping}
            />

            <div className="card-surface p-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-espresso-600">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-espresso-600">
                  <dt>Frete</dt>
                  <dd>{shipping ? formatCurrency(shipping.price) : 'a calcular'}</dd>
                </div>
                <div className="flex justify-between border-t border-espresso-700/10 pt-3 font-display text-xl text-espresso-800">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>

              <Parcelamento dados={parcelas(total)} className="mt-3" />

              <button
                onClick={() => navigate('/checkout')}
                disabled={!shipping}
                className="btn-primary btn-lg mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Finalizar compra
              </button>
              {!shipping && (
                <p className="mt-2 text-center text-xs text-espresso-400">
                  Calcule o frete para continuar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
