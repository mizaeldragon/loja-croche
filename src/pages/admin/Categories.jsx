import { useState } from 'react'
import { Plus, Pencil, Trash2, Tags, GripVertical } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { slugify, fileToDataUrl } from '../../lib/format'
import { notifySuccess } from '../../store/useToastStore'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import { TextField, TextAreaField } from '../../components/ui/Field'

const emptyCategory = { name: '', description: '', image: '', order: 1 }

export default function Categories() {
  usePageHeader('Categorias', 'Organize os produtos do ateliê por categoria')

  const categories = useCatalogStore((s) => s.categories)
  const products = useCatalogStore((s) => s.products)
  const addCategory = useCatalogStore((s) => s.addCategory)
  const updateCategory = useCatalogStore((s) => s.updateCategory)
  const deleteCategory = useCatalogStore((s) => s.deleteCategory)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyCategory)
  const [toDelete, setToDelete] = useState(null)

  const openNew = () => {
    setEditing(null)
    setForm({ ...emptyCategory, order: categories.length + 1 })
    setModalOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm(c)
    setModalOpen(true)
  }

  const onImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file)
    setForm((f) => ({ ...f, image: url }))
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.name?.trim()) return
    const payload = { ...form, slug: slugify(form.name), order: Number(form.order) || 1 }
    if (editing) {
      updateCategory(editing.id, payload)
      notifySuccess('Categoria atualizada.')
    } else {
      addCategory(payload)
      notifySuccess('Categoria criada com sucesso.')
    }
    setModalOpen(false)
  }

  const productCount = (slug) => products.filter((p) => p.category === slug).length
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-500">{categories.length} categorias cadastradas</p>
        <button onClick={openNew} className="btn-primary btn-md">
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={Tags} title="Nenhuma categoria" description="Crie categorias para organizar seus produtos." action={<button onClick={openNew} className="btn-primary btn-sm"><Plus size={14}/> Criar categoria</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c) => (
            <div key={c.id} className="card-surface overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold text-espresso-600">
                  <GripVertical size={11} /> Ordem {c.order}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-espresso-800">{c.name}</h3>
                  <span className="chip shrink-0">{productCount(c.slug)} produtos</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-espresso-500">{c.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-secondary btn-sm flex-1">
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => setToDelete(c)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-terracotta-600 hover:bg-terracotta-600/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={save} className="space-y-4">
          <TextField label="Nome da categoria" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Roupas" />
          <TextAreaField label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descrição da categoria" />
          <div>
            <label className="label-field">Imagem de capa</label>
            <div className="flex items-center gap-3">
              {form.image && <img src={form.image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
              <label className="btn-secondary btn-sm cursor-pointer">
                Enviar imagem
                <input type="file" accept="image/*" className="hidden" onChange={onImage} />
              </label>
            </div>
          </div>
          <TextField label="Ordem de exibição" type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary btn-md flex-1">Cancelar</button>
            <button type="submit" className="btn-primary btn-md flex-1">Salvar categoria</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir categoria?"
        description={`Os produtos vinculados a "${toDelete?.name}" continuarão existindo, mas ficarão sem categoria.`}
        confirmLabel="Excluir categoria"
        onConfirm={() => { deleteCategory(toDelete.id); notifySuccess('Categoria excluída.') }}
      />
    </div>
  )
}
