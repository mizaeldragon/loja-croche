import { useState } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { api } from '../../lib/api'
import { formatCurrency } from '../../lib/format'

// Entregas da própria loja vêm primeiro: para quem é da cidade, são mais
// baratas e mais rápidas que qualquer transportadora.
const GRUPOS = [
  { tipos: ['retirada', 'local'], titulo: 'Entrega pela loja' },
  { tipos: ['transportadora'], titulo: 'Transportadoras' },
]

const maskCep = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2')

/**
 * Calcula o frete para um conjunto de itens.
 *
 * @param {Array} items    itens no formato da API ({ productId, quantity, ... })
 * @param {Function} onSelect  chamado com a opção escolhida (ou null ao recalcular)
 * @param {Object} selected    opção atualmente escolhida
 */
export default function ShippingCalculator({ items, onSelect, selected, zip, onZipChange }) {
  const [options, setOptions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const digits = (zip || '').replace(/\D/g, '')

  async function calcular(e) {
    e?.preventDefault()
    if (digits.length !== 8) {
      setError('Informe um CEP com 8 dígitos')
      return
    }

    setLoading(true)
    setError('')
    setOptions(null)
    onSelect?.(null)

    try {
      const data = await api.calcularFrete(digits, items)
      setOptions(data.opcoes)
      if (!data.opcoes.length) {
        setError('Nenhuma transportadora atende esse CEP no momento.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-espresso-700/10 bg-sand-50 p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-espresso-700">
        <Truck size={16} /> Calcular frete e prazo
      </p>

      <form onSubmit={calcular} className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="00000-000"
          inputMode="numeric"
          value={maskCep(zip || '')}
          onChange={(e) => onZipChange(e.target.value.replace(/\D/g, ''))}
          aria-label="CEP de entrega"
        />
        <button type="submit" className="btn-secondary btn-md" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Calcular'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {options?.length > 0 && (
        <div className="mt-4 space-y-4">
          {GRUPOS.map(({ tipos, titulo }) => {
            const doGrupo = options.filter((o) => tipos.includes(o.tipo))
            if (!doGrupo.length) return null

            return (
              <div key={titulo}>
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-espresso-400">
                  {titulo}
                </p>
                <ul className="space-y-2">
                  {doGrupo.map((opt) => {
                    const isSelected = selected?.id === opt.id
                    const gratis = opt.price === 0
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => onSelect?.(opt)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? 'border-terracotta-500 bg-terracotta-400/10'
                              : 'border-espresso-700/12 bg-white hover:border-espresso-700/30'
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-medium text-espresso-800">
                              {opt.carrier}
                            </span>
                            <span className="block text-xs text-espresso-500">
                              {opt.tipo === 'retirada'
                                ? 'Você combina o horário depois da compra'
                                : `${opt.days} ${opt.days === 1 ? 'dia útil' : 'dias úteis'}`}
                            </span>
                          </span>
                          <span
                            className={`font-display text-base ${
                              gratis ? 'text-emerald-700' : 'text-espresso-800'
                            }`}
                          >
                            {gratis ? 'Grátis' : formatCurrency(opt.price)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-3 text-xs text-espresso-400">
        Prazo contado a partir da postagem. Peças sob encomenda têm o tempo de produção somado.
      </p>
    </div>
  )
}
