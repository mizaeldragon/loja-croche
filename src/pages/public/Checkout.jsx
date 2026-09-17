import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Lock } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { api } from '../../lib/api'
import { formatCurrency } from '../../lib/format'

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const initialForm = {
  name: '',
  email: '',
  phone: '',
  document: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
}

// Definido fora do Checkout de propósito: se ficasse dentro, o React o trataria
// como um tipo novo a cada render e o input perderia o foco a cada tecla.
function Field({ label, field, value, onChange, error, className = '', ...props }) {
  return (
    <div className={className}>
      <label className="label-field" htmlFor={field}>
        {label}
      </label>
      <input
        id={field}
        className="input-field w-full"
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, zip, shipping, toApiItems } = useCartStore()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const total = subtotal + (shipping?.price ?? 0)

  // Retirada não tem entrega: pedir endereço aqui seria atrito à toa, e o
  // backend também não exige nesse caso.
  const ehRetirada = shipping?.tipo === 'retirada'

  // Sem itens ou sem frete escolhido não há o que finalizar.
  useEffect(() => {
    if (!items.length || !shipping) navigate('/carrinho', { replace: true })
  }, [items.length, shipping, navigate])

  // Autopreenche o endereço a partir do CEP já informado no carrinho.
  useEffect(() => {
    if (!zip || zip.length !== 8) return
    let cancelled = false
    api
      .buscarCep(zip)
      .then((data) => {
        if (cancelled) return
        setForm((f) => ({
          ...f,
          street: f.street || data.street,
          district: f.district || data.district,
          city: f.city || data.city,
          state: f.state || data.state,
        }))
      })
      .catch(() => {
        /* CEP não encontrado: a pessoa preenche na mão */
      })
    return () => {
      cancelled = true
    }
  }, [zip])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const { checkoutUrl } = await api.criarCheckout({
        items: toApiItems(),
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          document: form.document.replace(/\D/g, ''),
        },
        address: ehRetirada
          ? { zip }
          : {
              zip,
              street: form.street.trim(),
              number: form.number.trim(),
              complement: form.complement.trim() || undefined,
              district: form.district.trim(),
              city: form.city.trim(),
              state: form.state.toUpperCase(),
            },
        shippingOptionId: shipping.id,
      })

      // O carrinho só é limpo depois do retorno do pagamento aprovado —
      // se a pessoa desistir no Mercado Pago, ela volta e ainda tem tudo lá.
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err.message)
      if (Array.isArray(err.details)) {
        setFieldErrors(
          Object.fromEntries(err.details.map((d) => [d.campo.split('.').pop(), d.erro]))
        )
      }
      setLoading(false)
    }
  }

  const field = (name) => ({
    field: name,
    value: form[name],
    onChange: set(name),
    error: fieldErrors[name],
  })

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="container-page">
        <h1 className="font-display text-3xl text-espresso-800 sm:text-4xl">Finalizar compra</h1>
        <p className="mt-2 text-sm text-espresso-500">
          O pagamento é processado com segurança pelo Mercado Pago. Aceitamos PIX, cartão e boleto.
        </p>

        <form onSubmit={submit} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 font-display text-xl text-espresso-800">Seus dados</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome completo" {...field('name')} required className="sm:col-span-2" />
                <Field label="E-mail" {...field('email')} type="email" required />
                <Field
                  label="Telefone / WhatsApp"
                  {...field('phone')}
                  required
                  placeholder="(34) 90000-0000"
                />
                <Field
                  label="CPF"
                  {...field('document')}
                  required
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  className="sm:col-span-2"
                />
              </div>
            </section>

            {ehRetirada ? (
              <section className="rounded-2xl border border-espresso-700/10 bg-sand-50 p-5">
                <h2 className="font-display text-xl text-espresso-800">{shipping.carrier}</h2>
                <p className="mt-2 text-sm leading-relaxed text-espresso-600">
                  Não precisamos do seu endereço. Assim que o pagamento for confirmado, entramos
                  em contato para combinar o local e o horário da retirada.
                </p>
              </section>
            ) : (
            <section>
              <h2 className="mb-4 font-display text-xl text-espresso-800">Endereço de entrega</h2>
              <p className="mb-4 text-sm text-espresso-500">
                CEP <strong>{zip}</strong> ·{' '}
                <Link to="/carrinho" className="underline hover:text-terracotta-600">
                  alterar
                </Link>
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <Field label="Rua" {...field('street')} required className="sm:col-span-4" />
                <Field label="Número" {...field('number')} required className="sm:col-span-2" />
                <Field label="Complemento" {...field('complement')} className="sm:col-span-3" />
                <Field label="Bairro" {...field('district')} required className="sm:col-span-3" />
                <Field label="Cidade" {...field('city')} required className="sm:col-span-4" />
                <div className="sm:col-span-2">
                  <label className="label-field" htmlFor="state">
                    UF
                  </label>
                  <select
                    id="state"
                    className="input-field w-full"
                    value={form.state}
                    onChange={set('state')}
                    required
                  >
                    <option value="">—</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-surface p-5">
              <h2 className="mb-4 font-display text-lg text-espresso-800">Resumo</h2>

              <ul className="space-y-3 border-b border-espresso-700/10 pb-4">
                {items.map((i) => (
                  <li key={i.key} className="flex justify-between gap-3 text-sm">
                    <span className="text-espresso-600">
                      {i.quantity}× {i.name}
                      {(i.color || i.size) && (
                        <span className="block text-xs text-espresso-400">
                          {[i.color, i.size].filter(Boolean).join(' • ')}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-espresso-800">
                      {formatCurrency(i.price * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-2 py-4 text-sm">
                <div className="flex justify-between text-espresso-600">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-espresso-600">
                  <dt>{shipping?.carrier}</dt>
                  <dd>{formatCurrency(shipping?.price ?? 0)}</dd>
                </div>
                <div className="flex justify-between border-t border-espresso-700/10 pt-3 font-display text-xl text-espresso-800">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              </dl>

              {error && (
                <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary btn-lg w-full disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Redirecionando...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Ir para o pagamento
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-espresso-400">
                Você será levada ao ambiente seguro do Mercado Pago.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
