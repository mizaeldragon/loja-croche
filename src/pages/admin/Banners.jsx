import { useState } from 'react'
import { Save, Plus, Trash2, ImagePlus } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { fileToDataUrl } from '../../lib/format'
import { notifySuccess } from '../../store/useToastStore'
import { TextField, TextAreaField } from '../../components/ui/Field'

const TABS = [
  { id: 'hero', label: 'Banner Principal' },
  { id: 'promo', label: 'Banner Promocional' },
  { id: 'sobre', label: 'Sobre a Marca' },
  { id: 'beneficios', label: 'Benefícios' },
  { id: 'faq', label: 'Perguntas Frequentes' },
  { id: 'cta', label: 'Chamada Final (CTA)' },
]

function ImagePickerInline({ label, value, onChange }) {
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await fileToDataUrl(file))
  }
  return (
    <div>
      <label className="label-field">{label}</label>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="h-16 w-16 rounded-xl object-cover" />}
        <label className="btn-secondary btn-sm cursor-pointer">
          <ImagePlus size={14} /> Trocar imagem
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
    </div>
  )
}

export default function Banners() {
  usePageHeader('Banners & Conteúdo', 'Edite os textos e imagens da landing page sem tocar em código')

  const banners = useCatalogStore((s) => s.banners)
  const settings = useCatalogStore((s) => s.settings)
  const faqs = useCatalogStore((s) => s.faqs)
  const updateHeroBanner = useCatalogStore((s) => s.updateHeroBanner)
  const updatePromoBanner = useCatalogStore((s) => s.updatePromoBanner)
  const updateSettings = useCatalogStore((s) => s.updateSettings)
  const addFaq = useCatalogStore((s) => s.addFaq)
  const updateFaq = useCatalogStore((s) => s.updateFaq)
  const deleteFaq = useCatalogStore((s) => s.deleteFaq)

  const [tab, setTab] = useState('hero')
  const [hero, setHero] = useState(banners.hero)
  const [promo, setPromo] = useState(banners.promo)
  const [about, setAbout] = useState(settings)
  const [benefits, setBenefits] = useState(settings.benefits)
  const [cta, setCta] = useState({ ctaTitle: settings.ctaTitle, ctaSubtitle: settings.ctaSubtitle })

  const saveHero = () => { updateHeroBanner(hero); notifySuccess('Banner principal atualizado.') }
  const savePromo = () => { updatePromoBanner(promo); notifySuccess('Banner promocional atualizado.') }
  const saveAbout = () => {
    updateSettings({
      aboutTitle: about.aboutTitle,
      aboutText: about.aboutText,
      aboutImage: about.aboutImage,
      aboutHighlights: about.aboutHighlights,
    })
    notifySuccess('Seção "Sobre" atualizada.')
  }
  const saveBenefits = () => { updateSettings({ benefits }); notifySuccess('Benefícios atualizados.') }
  const saveCta = () => { updateSettings(cta); notifySuccess('Chamada final atualizada.') }

  const updateHighlight = (idx, key, value) => {
    const copy = [...about.aboutHighlights]
    copy[idx] = { ...copy[idx], [key]: value }
    setAbout({ ...about, aboutHighlights: copy })
  }

  const updateBenefit = (idx, key, value) => {
    const copy = [...benefits]
    copy[idx] = { ...copy[idx], [key]: value }
    setBenefits(copy)
  }
  const addBenefit = () => setBenefits([...benefits, { title: 'Novo benefício', desc: 'Descrição do diferencial' }])
  const removeBenefit = (idx) => setBenefits(benefits.filter((_, i) => i !== idx))

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-espresso-700 text-cream-50' : 'bg-white text-espresso-600 hover:bg-sand-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <div className="card-surface space-y-5 p-6">
          <h3 className="font-display text-lg text-espresso-800">Banner principal (Hero)</h3>
          <TextField label="Eyebrow (texto pequeno acima do título)" value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
          <TextAreaField label="Título de impacto" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
          <TextAreaField label="Subtítulo persuasivo" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Texto do botão principal" value={hero.primaryCta} onChange={(e) => setHero({ ...hero, primaryCta: e.target.value })} />
            <TextField label="Link do botão principal" value={hero.primaryCtaLink} onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })} />
            <TextField label="Texto do botão secundário" value={hero.secondaryCta} onChange={(e) => setHero({ ...hero, secondaryCta: e.target.value })} />
            <TextField label="Link do botão secundário" value={hero.secondaryCtaLink} onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })} />
          </div>
          <ImagePickerInline label="Imagem principal" value={hero.image} onChange={(url) => setHero({ ...hero, image: url })} />
          <button onClick={saveHero} className="btn-primary btn-md"><Save size={16} /> Salvar banner principal</button>
        </div>
      )}

      {tab === 'promo' && (
        <div className="card-surface space-y-5 p-6">
          <h3 className="font-display text-lg text-espresso-800">Banner promocional</h3>
          <p className="text-xs text-espresso-400">Exibido entre as seções de categorias e benefícios na home.</p>
          <TextField label="Título" value={promo.title} onChange={(e) => setPromo({ ...promo, title: e.target.value })} />
          <TextAreaField label="Subtítulo" value={promo.subtitle} onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Texto do botão" value={promo.ctaLabel} onChange={(e) => setPromo({ ...promo, ctaLabel: e.target.value })} />
            <TextField label="Link do botão" value={promo.ctaLink} onChange={(e) => setPromo({ ...promo, ctaLink: e.target.value })} />
          </div>
          <ImagePickerInline label="Imagem de fundo" value={promo.image} onChange={(url) => setPromo({ ...promo, image: url })} />
          <button onClick={savePromo} className="btn-primary btn-md"><Save size={16} /> Salvar banner promocional</button>
        </div>
      )}

      {tab === 'sobre' && (
        <div className="card-surface space-y-5 p-6">
          <h3 className="font-display text-lg text-espresso-800">Seção "Sobre a marca"</h3>
          <TextField label="Título da seção" value={about.aboutTitle} onChange={(e) => setAbout({ ...about, aboutTitle: e.target.value })} />
          <TextAreaField label="Texto sobre o ateliê" value={about.aboutText} onChange={(e) => setAbout({ ...about, aboutText: e.target.value })} />
          <ImagePickerInline label="Imagem do ateliê" value={about.aboutImage} onChange={(url) => setAbout({ ...about, aboutImage: url })} />
          <div>
            <label className="label-field">Números de destaque</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {about.aboutHighlights.map((h, idx) => (
                <div key={idx} className="rounded-2xl border border-espresso-700/8 bg-white p-3">
                  <input className="input-field mb-2 text-center font-display" value={h.value} onChange={(e) => updateHighlight(idx, 'value', e.target.value)} />
                  <input className="input-field text-center text-xs" value={h.label} onChange={(e) => updateHighlight(idx, 'label', e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={saveAbout} className="btn-primary btn-md"><Save size={16} /> Salvar seção "Sobre"</button>
        </div>
      )}

      {tab === 'beneficios' && (
        <div className="card-surface space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-espresso-800">Diferenciais / Benefícios</h3>
            <button onClick={addBenefit} className="btn-secondary btn-sm"><Plus size={14} /> Adicionar</button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {benefits.map((b, idx) => (
              <div key={idx} className="space-y-2 rounded-2xl border border-espresso-700/8 bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <input className="input-field font-semibold" value={b.title} onChange={(e) => updateBenefit(idx, 'title', e.target.value)} />
                  <button onClick={() => removeBenefit(idx)} className="shrink-0 rounded-lg p-2 text-terracotta-600 hover:bg-terracotta-600/10">
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea className="input-field min-h-[70px]" value={b.desc} onChange={(e) => updateBenefit(idx, 'desc', e.target.value)} />
              </div>
            ))}
          </div>
          <button onClick={saveBenefits} className="btn-primary btn-md"><Save size={16} /> Salvar benefícios</button>
        </div>
      )}

      {tab === 'faq' && (
        <div className="card-surface space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-espresso-800">Perguntas frequentes</h3>
            <button onClick={() => addFaq({ question: 'Nova pergunta', answer: 'Resposta da pergunta.' })} className="btn-secondary btn-sm">
              <Plus size={14} /> Adicionar pergunta
            </button>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="space-y-2 rounded-2xl border border-espresso-700/8 bg-white p-4">
                <div className="flex items-start gap-2">
                  <input
                    className="input-field font-semibold"
                    value={f.question}
                    onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                  />
                  <button onClick={() => deleteFaq(f.id)} className="shrink-0 rounded-lg p-2.5 text-terracotta-600 hover:bg-terracotta-600/10">
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  className="input-field min-h-[70px]"
                  value={f.answer}
                  onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-espresso-400">As alterações nas perguntas são salvas automaticamente.</p>
        </div>
      )}

      {tab === 'cta' && (
        <div className="card-surface space-y-5 p-6">
          <h3 className="font-display text-lg text-espresso-800">Chamada final para contato</h3>
          <TextField label="Título" value={cta.ctaTitle} onChange={(e) => setCta({ ...cta, ctaTitle: e.target.value })} />
          <TextAreaField label="Subtítulo" value={cta.ctaSubtitle} onChange={(e) => setCta({ ...cta, ctaSubtitle: e.target.value })} />
          <button onClick={saveCta} className="btn-primary btn-md"><Save size={16} /> Salvar chamada final</button>
        </div>
      )}
    </div>
  )
}
