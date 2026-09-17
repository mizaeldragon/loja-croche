import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  Home,
  ExternalLink,
  Loader2,
  Save,
  Truck,
  XCircle,
  Zap,
} from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { api } from '../../lib/api'
import { notifyError, notifySuccess } from '../../store/useToastStore'
import { TextField, SelectField } from '../../components/ui/Field'

const maskCep = (v = '') =>
  v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')

function TestResult({ result }) {
  if (!result) return null
  const Icon = result.ok ? CheckCircle2 : XCircle
  return (
    <p
      className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
        result.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-800'
      }`}
    >
      <Icon size={14} className="mt-0.5 shrink-0" />
      {result.message}
    </p>
  )
}

export default function Integrations() {
  usePageHeader(
    'Integrações',
    'Conecte sua conta de pagamento e de envio — os dados ficam guardados de forma criptografada'
  )

  const [status, setStatus] = useState(null)
  const [entrega, setEntrega] = useState(null)
  const [salvandoEntrega, setSalvandoEntrega] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(null)
  const [tests, setTests] = useState({})

  // Campos de token começam vazios de propósito: o valor real nunca volta do
  // servidor. Vazio = "manter o que já está salvo".
  const [form, setForm] = useState({
    mpAccessToken: '',
    meToken: '',
    meMode: 'sandbox',
    meContactEmail: '',
    shipFromZip: '',
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    api
      .entrega()
      .then(setEntrega)
      .catch(() => setEntrega(null))
  }, [])

  useEffect(() => {
    api
      .integracoes()
      .then((s) => {
        setStatus(s)
        setForm((f) => ({
          ...f,
          meMode: s.melhorEnvio.mode,
          meContactEmail: s.melhorEnvio.contactEmail,
          shipFromZip: s.melhorEnvio.shipFromZip,
        }))
      })
      .catch((err) => notifyError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Campo de token vazio significa "manter o que já está salvo" — por isso
  // ele é removido do payload em vez de ir como string vazia.
  async function salvarTudo() {
    const payload = { ...form }
    for (const campo of ['mpAccessToken', 'meToken']) {
      if (!payload[campo]) delete payload[campo]
    }
    payload.shipFromZip = form.shipFromZip.replace(/\D/g, '')

    const novo = await api.salvarIntegracoes(payload)
    setForm((f) => ({ ...f, mpAccessToken: '', meToken: '' }))
    return novo
  }

  /**
   * "Conectar" faz as duas coisas de uma vez: salva o token e confirma com o
   * Mercado Pago que ele funciona. Sem isso, a lojista colaria o token, veria
   * "salvo" e só descobriria que estava errado na primeira venda perdida.
   */
  async function conectar(qual) {
    setTesting(qual)
    try {
      setStatus(await salvarTudo())
      const fn = qual === 'pagamento' ? api.testarPagamento : api.testarFrete
      const resultado = await fn()
      setTests((t) => ({ ...t, [qual]: resultado }))
    } catch (err) {
      setTests((t) => ({ ...t, [qual]: { ok: false, message: err.message } }))
    } finally {
      setTesting(null)
    }
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      // Só manda os tokens que foram digitados agora.
      const novo = await salvarTudo()
      setStatus(novo)
      notifySuccess('Integrações salvas.')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const setE = (k, v) => setEntrega((e) => ({ ...e, [k]: v }))

  async function salvarEntrega(e) {
    e.preventDefault()
    setSalvandoEntrega(true)
    try {
      const novo = await api.salvarEntrega({
        localEnabled: entrega.localEnabled,
        localLabel: entrega.localLabel,
        localPrice: Number(entrega.localPrice) || 0,
        localDays: Number(entrega.localDays) || 0,
        pickupEnabled: entrega.pickupEnabled,
        pickupLabel: entrega.pickupLabel,
        pickupInstructions: entrega.pickupInstructions || null,
      })
      setEntrega(novo)
      notifySuccess('Entrega local salva.')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSalvandoEntrega(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-espresso-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={save} className="space-y-6">
      {/* ------------------------------------------------ Mercado Pago */}
      <section className="card-surface space-y-5 p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-espresso-700/8 text-espresso-700">
              <CreditCard size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg text-espresso-800">Receber pagamentos</h3>
              <p className="text-sm text-espresso-500">
                PIX, cartão de débito, crédito e boleto — tudo pelo Mercado Pago.
              </p>
            </div>
          </div>
          {status?.mercadoPago.configured && (
            <span className="chip shrink-0 !text-emerald-800">Conectado</span>
          )}
        </header>

        <TextField
          label="Access Token do Mercado Pago (produção)"
          type="password"
          autoComplete="off"
          value={form.mpAccessToken}
          onChange={(e) => set('mpAccessToken', e.target.value)}
          placeholder={status?.mercadoPago.accessTokenMasked ?? 'APP_USR-...'}
          hint={
            status?.mercadoPago.configured
              ? 'Já existe um token salvo. Deixe em branco para mantê-lo.'
              : undefined
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => conectar('pagamento')}
            disabled={testing === 'pagamento'}
            className="btn-primary btn-md disabled:opacity-50"
          >
            {testing === 'pagamento' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Conectando...
              </>
            ) : (
              'Conectar Mercado Pago'
            )}
          </button>
          <span className="text-xs text-espresso-400">Não cobra nada de ninguém.</span>
        </div>

        <TestResult result={tests.pagamento} />

        <div className="rounded-2xl bg-sand-50 p-4">
          <p className="mb-2 text-sm font-medium text-espresso-700">
            Onde pego meu Access Token?
          </p>
          <ol className="space-y-1.5 text-sm leading-relaxed text-espresso-500">
            <li>
              1. Entre em{' '}
              <a
                href="https://www.mercadopago.com.br/developers/panel/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-terracotta-600 hover:underline"
              >
                mercadopago.com.br/developers <ExternalLink size={12} />
              </a>{' '}
              com a conta da sua loja
            </li>
            <li>
              2. Vá em <strong className="text-espresso-700">Suas integrações</strong> → crie ou
              abra uma aplicação
            </li>
            <li>
              3. Em <strong className="text-espresso-700">Credenciais de produção</strong>, copie o{' '}
              <strong className="text-espresso-700">Access Token</strong>
            </li>
            <li>4. Cole aqui e clique em Conectar</li>
          </ol>
        </div>

        <p className="flex items-start gap-2 rounded-2xl bg-terracotta-400/10 p-4 text-sm leading-relaxed text-espresso-600">
          <Zap size={15} className="mt-0.5 shrink-0 text-terracotta-600" />
          <span>
            O cliente paga na hora e o pedido cai direto em <strong>Pagos</strong>, sem você
            conferir nada. O dinheiro vai para a sua conta do Mercado Pago.
          </span>
        </p>
      </section>

      {/* ------------------------------------------------- Melhor Envio */}
      <section className="card-surface space-y-5 p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-espresso-700/8 text-espresso-700">
              <Truck size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg text-espresso-800">Melhor Envio</h3>
              <p className="text-sm text-espresso-500">
                Calcula o frete no site e gera as etiquetas de postagem.
              </p>
            </div>
          </div>
          {status?.melhorEnvio.configured && (
            <span className="chip shrink-0 !text-emerald-800">Conectado</span>
          )}
        </header>

        <a
          href="https://melhorenvio.com.br/painel/gerenciar/tokens"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-terracotta-600 hover:underline"
        >
          Onde gerar meu token <ExternalLink size={13} />
        </a>

        <SelectField
          label="Modo"
          value={form.meMode}
          onChange={(e) => set('meMode', e.target.value)}
        >
          <option value="sandbox">Teste (sandbox)</option>
          <option value="production">Produção</option>
        </SelectField>

        <p className="rounded-xl bg-sand-50 px-3.5 py-2.5 text-xs leading-relaxed text-espresso-500">
          Teste e produção são <strong>contas separadas</strong> no Melhor Envio. O token de uma não
          funciona na outra — se trocar o modo, troque o token também.
        </p>

        <TextField
          label="Token de API"
          type="password"
          autoComplete="off"
          value={form.meToken}
          onChange={(e) => set('meToken', e.target.value)}
          placeholder={status?.melhorEnvio.tokenMasked ?? ''}
          hint={
            status?.melhorEnvio.configured
              ? 'Já existe um token salvo. Deixe em branco para mantê-lo.'
              : 'O token tem validade — anote a data de expiração ao gerar.'
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="CEP de origem"
            value={maskCep(form.shipFromZip)}
            onChange={(e) => set('shipFromZip', e.target.value)}
            inputMode="numeric"
            placeholder="00000-000"
            hint="De onde você posta as peças."
          />
          <TextField
            label="E-mail de contato"
            type="email"
            value={form.meContactEmail}
            onChange={(e) => set('meContactEmail', e.target.value)}
            hint="Exigido pelo Melhor Envio para identificar a loja."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => conectar('frete')}
            disabled={testing === 'frete'}
            className="btn-secondary btn-sm disabled:opacity-50"
          >
            {testing === 'frete' ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Testando...
              </>
            ) : (
              'Testar conexão'
            )}
          </button>
          <span className="text-xs text-espresso-400">Só consulta sua conta, não posta nada.</span>
        </div>

        <TestResult result={tests.frete} />
      </section>

        <button type="submit" disabled={saving} className="btn-primary btn-md w-full disabled:opacity-60">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar integrações'}
        </button>
      </form>

      {/* ------------------------------------------------- entrega local */}
      {entrega && (
        <form onSubmit={salvarEntrega} className="card-surface space-y-5 p-6">
          <header className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-espresso-700/8 text-espresso-700">
              <Home size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg text-espresso-800">Entrega na sua cidade</h3>
              <p className="text-sm text-espresso-500">
                Para quem mora perto, transportadora sai cara e lenta. Estas opções aparecem só
                para compradores da sua cidade.
              </p>
            </div>
          </header>

          {entrega.cidadeAtendida ? (
            <p className="rounded-xl bg-sand-50 px-3.5 py-2.5 text-sm text-espresso-600">
              Cidade atendida:{' '}
              <strong className="text-espresso-800">
                {entrega.cidadeAtendida.city}/{entrega.cidadeAtendida.state}
              </strong>{' '}
              — vem do seu CEP de origem, acima. Mudou de endereço? Troque o CEP e salve.
            </p>
          ) : (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
              Preencha o <strong>CEP de origem</strong> acima e salve as integrações. É ele que
              define qual cidade recebe estas opções.
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={entrega.pickupEnabled}
              onChange={(e) => setE('pickupEnabled', e.target.checked)}
              className="mt-1 h-4 w-4 accent-terracotta-500"
            />
            <span>
              <span className="block text-sm font-medium text-espresso-800">
                Permitir retirada
              </span>
              <span className="block text-xs text-espresso-500">
                Frete grátis. O cliente combina com você onde e quando buscar.
              </span>
            </span>
          </label>

          {entrega.pickupEnabled && (
            <div className="ml-7 space-y-4">
              <TextField
                label="Como aparece no site"
                value={entrega.pickupLabel}
                onChange={(e) => setE('pickupLabel', e.target.value)}
              />
              <TextField
                label="O que o cliente lê depois de comprar"
                value={entrega.pickupInstructions ?? ''}
                onChange={(e) => setE('pickupInstructions', e.target.value)}
                hint="Ex: Combinamos o ponto e o horário pelo WhatsApp."
              />
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 border-t border-espresso-700/8 pt-5">
            <input
              type="checkbox"
              checked={entrega.localEnabled}
              onChange={(e) => setE('localEnabled', e.target.checked)}
              className="mt-1 h-4 w-4 accent-terracotta-500"
            />
            <span>
              <span className="block text-sm font-medium text-espresso-800">
                Entregar na cidade
              </span>
              <span className="block text-xs text-espresso-500">
                Você leva ou manda por motoboy, com valor e prazo definidos por você.
              </span>
            </span>
          </label>

          {entrega.localEnabled && (
            <div className="ml-7 space-y-4">
              <TextField
                label="Como aparece no site"
                value={entrega.localLabel}
                onChange={(e) => setE('localLabel', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Valor (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={entrega.localPrice}
                  onChange={(e) => setE('localPrice', e.target.value)}
                  hint="Zero = frete grátis na cidade."
                />
                <TextField
                  label="Prazo (dias úteis)"
                  type="number"
                  min="0"
                  value={entrega.localDays}
                  onChange={(e) => setE('localDays', e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={salvandoEntrega}
            className="btn-primary btn-md w-full disabled:opacity-60"
          >
            <Save size={16} /> {salvandoEntrega ? 'Salvando...' : 'Salvar entrega local'}
          </button>
        </form>
      )}
    </div>
  )
}
