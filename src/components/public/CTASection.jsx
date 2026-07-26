import { useState } from 'react'
import { Send, Phone, Mail } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { notifySuccess } from '../../store/useToastStore'
import { TextField, TextAreaField } from '../ui/Field'
import { Reveal } from '../motion/Reveal'

export default function CTASection() {
  const settings = useCatalogStore((s) => s.settings)
  const addOrder = useCatalogStore((s) => s.addOrder)
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [sending, setSending] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.contact) return
    setSending(true)
    setTimeout(() => {
      addOrder({
        customerName: form.name,
        contact: form.contact,
        email: form.contact.includes('@') ? form.contact : '',
        items: `Orçamento: ${form.message || 'Sem detalhes informados'}`,
        total: null,
        type: 'orcamento',
      })
      setSending(false)
      setForm({ name: '', contact: '', message: '' })
      notifySuccess('Recebemos sua solicitação! Retornaremos em breve.')
    }, 700)
  }

  return (
    <section id="contato" className="relative overflow-hidden py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#FDD7CA_0%,_#FFF7F3_60%)]" />
      <div className="container-page relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Vamos criar algo especial</span>
          <h2 className="mt-3 text-balance font-display text-3xl leading-tight text-espresso-800 sm:text-4xl">
            {settings.ctaTitle}
          </h2>
          <p className="mt-4 max-w-md text-balance text-[0.95rem] leading-relaxed text-espresso-500">
            {settings.ctaSubtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary btn-lg"
            >
              <Phone size={16} /> Chamar no WhatsApp
            </a>
            <a href={`mailto:${settings.email}`} className="btn-secondary btn-lg bg-white hover:bg-white">
              <Mail size={16} /> Enviar e-mail
            </a>
          </div>
        </Reveal>

        <Reveal variant="scale" delay={0.1}>
          <form onSubmit={submit} className="card-surface space-y-4 p-7 sm:p-8">
            <h3 className="font-display text-lg text-espresso-800">Solicite um orçamento</h3>
            <TextField
              label="Seu nome"
              placeholder="Como podemos te chamar?"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="WhatsApp ou e-mail"
              placeholder="(11) 90000-0000"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
            <TextAreaField
              label="Conte sua ideia"
              placeholder="Ex: gostaria de um cardigan personalizado na cor terracota, tamanho M..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button type="submit" disabled={sending} className="btn-primary btn-md w-full">
              {sending ? 'Enviando...' : <>Enviar solicitação <Send size={15} /></>}
            </button>
            <p className="text-center text-xs text-espresso-400">Retornamos o contato em até 24h úteis.</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
