import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { useAuthStore } from '../../store/useAuthStore'
import { notifySuccess } from '../../store/useToastStore'
import { TextField, TextAreaField } from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

export default function Settings() {
  usePageHeader('Configurações', 'Dados gerais da marca, contato e preferências do sistema')

  const settings = useCatalogStore((s) => s.settings)
  const updateSettings = useCatalogStore((s) => s.updateSettings)
  const resetToSeed = useCatalogStore((s) => s.resetToSeed)
  const currentUser = useAuthStore((s) => s.currentUser)

  const [form, setForm] = useState(settings)
  const [confirmReset, setConfirmReset] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const save = (e) => {
    e.preventDefault()
    updateSettings(form)
    notifySuccess('Configurações salvas com sucesso.')
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-surface space-y-4 p-6">
            <h3 className="font-display text-lg text-espresso-800">Identidade da marca</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Nome do ateliê" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
              <TextField label="Slogan / tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <TextAreaField label="Texto do rodapé" value={form.footerText} onChange={(e) => set('footerText', e.target.value)} />
          </div>

          <div className="card-surface space-y-4 p-6">
            <h3 className="font-display text-lg text-espresso-800">Contato & Redes Sociais</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="E-mail de contato" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <TextField label="Telefone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              <TextField label="WhatsApp (somente números com DDI)" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} hint="Ex: 5511988884455" />
              <TextField label="Instagram" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
              <TextField label="Facebook" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
              <TextField label="Endereço / atendimento" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-surface space-y-4 p-6">
            <h3 className="font-display text-lg text-espresso-800">Meu perfil</h3>
            <div className="flex items-center gap-3">
              <img src={currentUser?.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-espresso-800">{currentUser?.name}</p>
                <p className="text-xs text-espresso-400">{currentUser?.email}</p>
                <span className="chip mt-1 capitalize">{currentUser?.role}</span>
              </div>
            </div>
            <p className="text-xs text-espresso-400">Para alterar seus dados de acesso, procure a administração em Usuários.</p>
          </div>

          <button type="submit" className="btn-primary btn-md w-full">
            <Save size={16} /> Salvar configurações
          </button>

          <div className="card-surface space-y-3 border-terracotta-600/15 p-6">
            <h3 className="font-display text-base text-espresso-800">Zona de manutenção</h3>
            <p className="text-xs leading-relaxed text-espresso-400">
              Restaura produtos, categorias, depoimentos e textos para os dados de demonstração original.
            </p>
            <button type="button" onClick={() => setConfirmReset(true)} className="btn-secondary btn-sm w-full text-terracotta-600">
              <RotateCcw size={14} /> Restaurar dados de exemplo
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restaurar dados de exemplo?"
        description="Todos os produtos, categorias, depoimentos e conteúdos personalizados serão substituídos pelos dados originais de demonstração."
        confirmLabel="Restaurar"
        onConfirm={() => { resetToSeed(); notifySuccess('Dados restaurados para o padrão de demonstração.') }}
      />
    </div>
  )
}
