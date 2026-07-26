import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { slugify } from '../../lib/format'
import { notifySuccess, notifyError } from '../../store/useToastStore'
import { TextField, TextAreaField, SelectField, ToggleField, TagInput } from '../../components/ui/Field'
import ImageUploader from '../../components/ui/ImageUploader'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  promoPrice: '',
  category: '',
  colors: [],
  sizes: [],
  tags: [],
  status: 'draft',
  stock: 0,
  images: [],
  featured: false,
  bestseller: false,
  isNew: true,
  slug: '',
  seoTitle: '',
  seoDescription: '',
  order: 1,
}

export default function ProductForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  usePageHeader(isEditing ? 'Editar produto' : 'Novo produto', isEditing ? 'Atualize as informações da peça' : 'Cadastre uma nova peça no catálogo')

  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const addProduct = useCatalogStore((s) => s.addProduct)
  const updateProduct = useCatalogStore((s) => s.updateProduct)
  const deleteProduct = useCatalogStore((s) => s.deleteProduct)

  const existing = isEditing ? products.find((p) => p.id === id) : null
  const [form, setForm] = useState(existing || emptyProduct)
  const [slugTouched, setSlugTouched] = useState(isEditing)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing?.id])

  useEffect(() => {
    if (!slugTouched) setForm((f) => ({ ...f, slug: slugify(f.name) }))
  }, [form.name, slugTouched])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = 'Informe o nome do produto.'
    if (!form.category) errs.category = 'Selecione uma categoria.'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Informe um preço válido.'
    if (form.promoPrice && Number(form.promoPrice) >= Number(form.price)) {
      errs.promoPrice = 'O preço promocional deve ser menor que o preço normal.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e, forceStatus) => {
    e.preventDefault()
    if (!validate()) {
      notifyError('Verifique os campos destacados antes de salvar.')
      return
    }
    const finalStatus = forceStatus || form.status
    const payload = {
      ...form,
      price: Number(form.price),
      promoPrice: form.promoPrice ? Number(form.promoPrice) : null,
      stock: Number(form.stock) || 0,
      order: Number(form.order) || 1,
      status: finalStatus,
      seoTitle: form.seoTitle || form.name,
      seoDescription: form.seoDescription || form.description?.slice(0, 150),
      shortDescription: form.description?.slice(0, 90) + (form.description?.length > 90 ? '…' : ''),
    }

    if (isEditing) {
      updateProduct(id, payload)
      notifySuccess('Produto atualizado com sucesso.')
    } else {
      addProduct(payload)
      notifySuccess(finalStatus === 'published' ? 'Produto publicado com sucesso.' : 'Produto salvo como rascunho.')
    }
    navigate('/admin/produtos')
  }

  if (isEditing && !existing) {
    return (
      <div className="py-16 text-center">
        <p className="text-espresso-500">Produto não encontrado.</p>
        <Link to="/admin/produtos" className="btn-secondary btn-sm mt-4 inline-flex">
          Voltar para produtos
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/produtos" className="inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-espresso-700">
          <ChevronLeft size={16} /> Voltar para produtos
        </Link>
        {isEditing && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="btn-ghost btn-sm text-terracotta-600 hover:bg-terracotta-600/5"
          >
            <Trash2 size={15} /> Excluir produto
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-surface space-y-5 p-6">
            <h3 className="font-display text-lg text-espresso-800">Informações gerais</h3>
            <TextField
              label="Nome do produto"
              placeholder="Ex: Blusa Amora Trançada"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={errors.name}
            />
            <TextAreaField
              label="Descrição completa"
              placeholder="Descreva os materiais, técnica e detalhes da peça..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Preço (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                error={errors.price}
              />
              <TextField
                label="Preço promocional (R$)"
                type="number"
                step="0.01"
                min="0"
                placeholder="Opcional"
                value={form.promoPrice || ''}
                onChange={(e) => set('promoPrice', e.target.value)}
                error={errors.promoPrice}
                hint="Deixe em branco se não houver promoção"
              />
            </div>
          </div>

          <div className="card-surface space-y-5 p-6">
            <h3 className="font-display text-lg text-espresso-800">Imagens do produto</h3>
            <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
          </div>

          <div className="card-surface space-y-5 p-6">
            <h3 className="font-display text-lg text-espresso-800">Variações</h3>
            <TagInput
              label="Cores disponíveis"
              values={form.colors}
              onChange={(v) => set('colors', v)}
              placeholder="Digite e pressione Enter"
              hint="Ex: Terracota, Areia, Marfim"
            />
            <TagInput
              label="Tamanhos disponíveis"
              values={form.sizes}
              onChange={(v) => set('sizes', v)}
              placeholder="Digite e pressione Enter"
              hint="Ex: P, M, G ou medidas sob encomenda"
            />
            <TagInput
              label="Tags"
              values={form.tags}
              onChange={(v) => set('tags', v)}
              placeholder="Digite e pressione Enter"
              hint="Usadas na busca do site (ex: verão, presente, inverno)"
            />
          </div>

          <div className="card-surface space-y-5 p-6">
            <h3 className="font-display text-lg text-espresso-800">SEO</h3>
            <TextField
              label="Slug (URL)"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)) }}
              hint={`linhaeponto.com/produto/${form.slug || 'slug-do-produto'}`}
            />
            <TextField
              label="SEO Title"
              placeholder="Título para mecanismos de busca"
              value={form.seoTitle}
              onChange={(e) => set('seoTitle', e.target.value)}
            />
            <TextAreaField
              label="SEO Description"
              placeholder="Descrição curta para mecanismos de busca"
              value={form.seoDescription}
              onChange={(e) => set('seoDescription', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-surface space-y-4 p-6">
            <h3 className="font-display text-lg text-espresso-800">Publicação</h3>
            <SelectField label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </SelectField>
            <ToggleField label="Produto em destaque" description="Exibir na home" checked={form.featured} onChange={(v) => set('featured', v)} />
            <ToggleField label="Mais vendido" description="Selo de mais vendido" checked={form.bestseller} onChange={(v) => set('bestseller', v)} />
            <ToggleField label="Novidade" description="Selo de novidade" checked={form.isNew} onChange={(v) => set('isNew', v)} />
          </div>

          <div className="card-surface space-y-4 p-6">
            <h3 className="font-display text-lg text-espresso-800">Organização</h3>
            <SelectField label="Categoria" value={form.category} onChange={(e) => set('category', e.target.value)} error={errors.category}>
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </SelectField>
            <TextField
              label="Quantidade em estoque"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
            />
            <TextField
              label="Ordem de exibição"
              type="number"
              min="1"
              value={form.order}
              onChange={(e) => set('order', e.target.value)}
              hint="Menor número aparece primeiro"
            />
          </div>

          <div className="sticky bottom-4 space-y-2.5">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, isEditing ? undefined : 'published')}
              className="btn-primary btn-md w-full"
            >
              <Save size={16} /> {isEditing ? 'Salvar alterações' : 'Publicar produto'}
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                className="btn-secondary btn-md w-full"
              >
                Salvar como rascunho
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir produto?"
        description={`Tem certeza que deseja excluir "${form.name}"? Essa ação não poderá ser desfeita.`}
        confirmLabel="Excluir produto"
        onConfirm={() => {
          deleteProduct(id)
          notifySuccess('Produto excluído.')
          navigate('/admin/produtos')
        }}
      />
    </form>
  )
}
