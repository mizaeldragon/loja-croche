import { useState } from 'react'
import { Plus, Pencil, Trash2, Star, MessageSquareQuote } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { fileToDataUrl } from '../../lib/format'
import { notifySuccess } from '../../store/useToastStore'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { TextField, TextAreaField, ToggleField } from '../../components/ui/Field'

const emptyTestimonial = { name: '', role: '', text: '', rating: 5, avatar: '', featured: false }

export default function Testimonials() {
  usePageHeader('Depoimentos', 'Gerencie os relatos exibidos na landing page')

  const testimonials = useCatalogStore((s) => s.testimonials)
  const addTestimonial = useCatalogStore((s) => s.addTestimonial)
  const updateTestimonial = useCatalogStore((s) => s.updateTestimonial)
  const deleteTestimonial = useCatalogStore((s) => s.deleteTestimonial)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTestimonial)
  const [toDelete, setToDelete] = useState(null)

  const openNew = () => { setEditing(null); setForm(emptyTestimonial); setModalOpen(true) }
  const openEdit = (t) => { setEditing(t); setForm(t); setModalOpen(true) }

  const onAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    setForm((f) => ({ ...f, avatar: url }))
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.name?.trim() || !form.text?.trim()) return
    if (editing) {
      updateTestimonial(editing.id, form)
      notifySuccess('Depoimento atualizado.')
    } else {
      addTestimonial(form)
      notifySuccess('Depoimento adicionado.')
    }
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-500">{testimonials.length} depoimentos cadastrados</p>
        <button onClick={openNew} className="btn-primary btn-md">
          <Plus size={16} /> Novo depoimento
        </button>
      </div>

      {testimonials.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="Nenhum depoimento" description="Adicione relatos de clientes para gerar mais confiança na landing page." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="card-surface p-6">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={13} className="fill-gold-400 text-gold-400" />)}
              </div>
              <p className="text-sm leading-relaxed text-espresso-600 line-clamp-4">"{t.text}"</p>
              <div className="mt-5 flex items-center justify-between gap-2 border-t border-espresso-700/8 pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <img src={t.avatar} alt={t.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-espresso-800">{t.name}</p>
                    <p className="truncate text-xs text-espresso-400">{t.role}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(t)} className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-sand-100 hover:text-espresso-700">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setToDelete(t)} className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-terracotta-600/10 hover:text-terracotta-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {t.featured && <span className="chip mt-3 !bg-gold-400/15 !text-gold-500">Em destaque na home</span>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar depoimento' : 'Novo depoimento'}>
        <form onSubmit={save} className="space-y-4">
          <TextField label="Nome do cliente" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Localização / cargo" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Cliente • São Paulo, SP" />
          <TextAreaField label="Depoimento" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
          <div>
            <label className="label-field">Avaliação</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <Star size={22} className={n <= form.rating ? 'fill-gold-400 text-gold-400' : 'text-espresso-200'} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Foto</label>
            <div className="flex items-center gap-3">
              {form.avatar && <img src={form.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />}
              <label className="btn-secondary btn-sm cursor-pointer">
                Enviar foto
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
              </label>
            </div>
          </div>
          <ToggleField label="Exibir em destaque" description="Aparece nos primeiros lugares da seção" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button type="submit" className="btn-primary btn-md flex-1">Salvar</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir depoimento?"
        description={`Deseja remover o depoimento de "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { deleteTestimonial(toDelete.id); notifySuccess('Depoimento excluído.') }}
      />
    </div>
  )
}
