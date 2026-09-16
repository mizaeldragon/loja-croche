import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { formatCurrency } from '../../lib/format'

/**
 * Mostra o parcelamento de um valor.
 *
 * `dados` vem do useParcelas, que por sua vez vem do Mercado Pago. Nada é
 * calculado aqui: o que aparece na vitrine é exatamente o que o comprador vai
 * encontrar no checkout.
 *
 * `compacto` é a versão de uma linha, para o card do produto.
 */
export default function Parcelamento({ dados, compacto = false, className = '' }) {
  const [aberto, setAberto] = useState(false)

  // Sem dados (Mercado Pago não configurado, fora do ar, ou valor sem
  // parcelamento) não mostramos nada — melhor omitir do que mentir.
  if (!dados?.maxSemJuros && !dados?.opcoes?.length) return null

  const destaque = dados.maxSemJuros

  if (compacto) {
    if (!destaque) return null
    return (
      <p className={`text-xs text-espresso-500 ${className}`}>
        ou {destaque.parcelas}x de{' '}
        <strong className="font-medium">{formatCurrency(destaque.valorParcela)}</strong> sem juros
      </p>
    )
  }

  const comJuros = dados.opcoes.filter((o) => o.temJuros)

  return (
    <div className={className}>
      {destaque ? (
        <p className="text-sm text-espresso-600">
          ou até <strong className="font-semibold text-espresso-800">{destaque.parcelas}x</strong> de{' '}
          <strong className="font-semibold text-espresso-800">
            {formatCurrency(destaque.valorParcela)}
          </strong>{' '}
          sem juros
        </p>
      ) : (
        <p className="text-sm text-espresso-600">Parcelamento disponível no cartão de crédito</p>
      )}

      {dados.opcoes.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-terracotta-600 hover:underline"
            aria-expanded={aberto}
          >
            Ver todas as parcelas
            <ChevronDown
              size={13}
              className={`transition-transform ${aberto ? 'rotate-180' : ''}`}
            />
          </button>

          {aberto && (
            <ul className="mt-3 divide-y divide-espresso-700/8 rounded-xl border border-espresso-700/10 bg-sand-50/60">
              {dados.opcoes.map((o) => (
                <li key={o.parcelas} className="flex justify-between gap-3 px-3.5 py-2 text-sm">
                  <span className="text-espresso-600">
                    {o.parcelas}x de {formatCurrency(o.valorParcela)}
                  </span>
                  <span className={o.temJuros ? 'text-espresso-400' : 'text-emerald-700'}>
                    {o.temJuros ? `total ${formatCurrency(o.valorTotal)}` : 'sem juros'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {comJuros.length > 0 && aberto && (
            <p className="mt-2 text-xs text-espresso-400">
              Parcelas com juros têm o valor total indicado. As condições finais dependem do seu
              cartão e aparecem na tela de pagamento.
            </p>
          )}
        </>
      )}
    </div>
  )
}
