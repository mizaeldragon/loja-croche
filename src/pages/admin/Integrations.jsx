import { useEffect, useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Home,
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

const maskCep = (v = '') => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')

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

/** Bolinha na aba: mostra de relance o que já está configurado. */
function TabDot({ ativo }) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
        ativo ? 'bg-emerald-600' : 'bg-espresso-700/20'
      }`}
      aria-hidden
    />
  )
}

export default function Integrations() {
  usePageHeader(
    'Integrações',
    'Conecte sua conta de pagamento e de envio — os dados ficam guardados de forma criptografada'
  )

  const [aba, setAba] = useState('pagamento')
  const [status, setStatus] = useState(null)
  const [entrega, setEntrega] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(null)
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
  const setE = (k, v) => setEntrega((e) => ({ ...e, [k]: v }))

  useEffect(() => {
    Promise.all([api.integracoes(), api.entrega().catch(() => null)])
      .then(([s, e]) => {
        setStatus(s)
        setEntrega(e)
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

  /**
   * Cada aba salva só os campos dela. Antes era um PUT único com tudo, o que
   * fazia a aba de pagamento reenviar a configuração de frete sem motivo.
   */
  async function salvarPagamento() {
    const payload = {}
    // Campo vazio significa "manter o token atual".
    if (form.mpAccessToken) payload.mpAccessToken = form.mpAccessToken

    const novo = await api.salvarIntegracoes(payload)
    setForm((f) => ({ ...f, mpAccessToken: '' }))
    setStatus(novo)
    return novo
  }

  async function salvarEnvio() {
    const payload = {
      meMode: form.meMode,
      meContactEmail: form.meContactEmail,
      shipFromZip: form.shipFromZip.replace(/\D/g, ''),
    }
    if (form.meToken) payload.meToken = form.meToken

    const novo = await api.salvarIntegracoes(payload)
    setForm((f) => ({ ...f, meToken: '' }))
    setStatus(novo)

    // A cidade atendida pela entrega local sai do CEP de origem: se ele mudou,
    // a outra aba precisa refletir isso na hora.
    setEntrega(await api.entrega().catch(() => entrega))
    return novo
  }

  /**
   * "Conectar" faz as duas coisas de uma vez: salva e confirma que funciona.
   * Sem isso, a lojista colaria o token, veria "salvo" e só descobriria que
   * estava errado na primeira venda perdida.
   */
  async function conectar(qual) {
    setTesting(qual)
    try {
      await (qual === 'pagamento' ? salvarPagamento() : salvarEnvio())
      const fn = qual === 'pagamento' ? api.testarPagamento : api.testarFrete
      const resultado = await fn()
      setTests((t) => ({ ...t, [qual]: resultado }))
    } catch (err) {
      setTests((t) => ({ ...t, [qual]: { ok: false, message: err.message } }))
    } finally {
      setTesting(null)
    }
  }

  async function salvarEntrega(e) {
    e.preventDefault()
    setSalvando('entrega')
    try {
      setEntrega(
        await api.salvarEntrega({
          localEnabled: entrega.localEnabled,
          localLabel: entrega.localLabel,
          localPrice: Number(entrega.localPrice) || 0,
          localDays: Number(entrega.localDays) || 0,
          pickupEnabled: entrega.pickupEnabled,
          pickupLabel: entrega.pickupLabel,
          pickupInstructions: entrega.pickupInstructions || null,
        })
      )
      notifySuccess('Entrega na cidade salva.')
    } catch (err) {
      notifyError(err.message)
    } finally {
      setSalvando(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-espresso-400" />
      </div>
    )
  }

  const ABAS = [
    {
      id: 'pagamento',
      label: 'Pagamento',
      curto: 'Pagamento',
      icon: CreditCard,
      ativo: Boolean(status?.mercadoPago.configured),
    },
    {
      id: 'envio',
      label: 'Envio pelo correio',
      curto: 'Correio',
      icon: Truck,
      ativo: Boolean(status?.melhorEnvio.configured),
    },
    {
      id: 'local',
      label: 'Entrega na cidade',
      curto: 'Cidade',
      icon: Home,
      ativo: Boolean(entrega?.localEnabled || entrega?.pickupEnabled),
    },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex gap-1 rounded-2xl bg-espresso-700/5 p-1">
        {ABAS.map(({ id, label, curto, icon: Icon, ativo }) => (
          <button
            key={id}
            type="button"
            onClick={() => setAba(id)}
            aria-current={aba === id ? 'page' : undefined}
            // min-w-0 é o que permite o botão encolher: item flex não reduz
            // abaixo do próprio conteúdo sem isso, e a barra estourava a tela
            // no celular.
            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3 sm:text-sm ${
              aba === id ? 'bg-white text-espresso-800 shadow-soft' : 'text-espresso-500'
            }`}
          >
            <Icon size={15} className="hidden shrink-0 sm:block" />
            <span className="truncate sm:hidden">{curto}</span>
            <span className="hidden truncate sm:inline">{label}</span>
            {/* A bolinha some no celular: o espaço vale mais para o rótulo. */}
            <span className="hidden sm:block">
              <TabDot ativo={ativo} />
            </span>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- pagamento */}
      {aba === 'pagamento' && (
        <section className="card-surface space-y-5 p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-espresso-800">Receber pagamentos</h3>
              <p className="text-sm text-espresso-500">
                PIX, cartão de débito, crédito e boleto — tudo pelo Mercado Pago.
              </p>
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
                3. Em <strong className="text-espresso-700">Credenciais de produção</strong>, copie
                o <strong className="text-espresso-700">Access Token</strong>
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
      )}

      {/* -------------------------------------------------------- envio */}
      {aba === 'envio' && (
        <section className="card-surface space-y-5 p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg text-espresso-800">Melhor Envio</h3>
              <p className="text-sm text-espresso-500">
                Calcula o frete no site e gera as etiquetas de postagem.
              </p>
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
            Teste e produção são <strong>contas separadas</strong> no Melhor Envio. O token de uma
            não funciona na outra — se trocar o modo, troque o token também.
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
                : 'Marque as permissões de envio ao gerar, senão a cotação é recusada.'
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="CEP de origem"
              value={maskCep(form.shipFromZip)}
              onChange={(e) => set('shipFromZip', e.target.value)}
              inputMode="numeric"
              placeholder="00000-000"
              hint="De onde você posta. Também define sua cidade na aba de entrega."
            />
            <TextField
              label="E-mail de contato"
              type="email"
              value={form.meContactEmail}
              onChange={(e) => set('meContactEmail', e.target.value)}
              hint="Exigido pelo Melhor Envio para identificar a loja."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => conectar('frete')}
              disabled={testing === 'frete'}
              className="btn-primary btn-md disabled:opacity-50"
            >
              {testing === 'frete' ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Conectando...
                </>
              ) : (
                'Conectar Melhor Envio'
              )}
            </button>
            <span className="text-xs text-espresso-400">
              Salva e faz uma cotação de teste. Não posta nada.
            </span>
          </div>

          <TestResult result={tests.frete} />
        </section>
      )}

      {/* ------------------------------------------------ entrega local */}
      {aba === 'local' &&
        (entrega ? (
          <form onSubmit={salvarEntrega} className="card-surface space-y-5 p-6">
            <header>
              <h3 className="font-display text-lg text-espresso-800">Entrega na sua cidade</h3>
              <p className="text-sm text-espresso-500">
                Para quem mora perto, transportadora sai cara e lenta. Estas opções aparecem só
                para compradores da sua cidade.
              </p>
            </header>

            {entrega.cidadeAtendida ? (
              <p className="rounded-xl bg-sand-50 px-3.5 py-2.5 text-sm text-espresso-600">
                Cidade atendida:{' '}
                <strong className="text-espresso-800">
                  {entrega.cidadeAtendida.city}/{entrega.cidadeAtendida.state}
                </strong>{' '}
                — vem do CEP de origem, na aba <strong>Envio pelo correio</strong>. Mudou de
                endereço? Troque o CEP lá.
              </p>
            ) : (
              <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                Preencha o <strong>CEP de origem</strong> na aba{' '}
                <strong>Envio pelo correio</strong> e salve. É ele que define qual cidade recebe
                estas opções.
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
              disabled={salvando === 'entrega'}
              className="btn-primary btn-md w-full disabled:opacity-60"
            >
              <Save size={16} />{' '}
              {salvando === 'entrega' ? 'Salvando...' : 'Salvar entrega na cidade'}
            </button>
          </form>
        ) : (
          <p className="card-surface p-6 text-sm text-espresso-500">
            Não foi possível carregar a configuração de entrega. Recarregue a página.
          </p>
        ))}
    </div>
  )
}
