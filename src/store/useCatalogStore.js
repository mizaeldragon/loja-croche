import { create } from 'zustand'
import { api } from '../lib/api'
import { notifyError } from './useToastStore'
import {
  seedBanners,
  seedCategories,
  seedFaqs,
  seedProducts,
  seedSettings,
  seedTestimonials,
} from '../lib/seed'

/**
 * Fonte de verdade: a API (Postgres). O seed continua importado apenas como
 * *forma inicial* do estado — dezenas de componentes leem coisas aninhadas
 * (`settings.aboutHighlights.map`, `banners.hero.title`) e quebrariam com
 * `undefined` no primeiro render, antes do fetch responder.
 *
 * Assim que `load()` termina, tudo é substituído pelo que veio do banco.
 * Se a API estiver fora, `error` é preenchido e o conteúdo visível é o do
 * seed — por isso o PublicLayout mostra um aviso quando isso acontece.
 */
const initialShape = {
  categories: seedCategories,
  products: seedProducts,
  testimonials: seedTestimonials,
  faqs: seedFaqs,
  banners: seedBanners,
  settings: seedSettings,
  orders: [],
  quotes: [],
}

/**
 * Toda ação de escrita passa por aqui. Antes, elas eram síncronas e não
 * podiam falhar; agora vão à rede. Este wrapper garante que nenhuma falha
 * fique invisível — mostra o toast e ainda relança, para quem quiser tratar
 * (como o ProductForm, que destaca os campos inválidos).
 */
const withErrorToast =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      notifyError(err.message || 'Não foi possível salvar. Tente novamente.')
      throw err
    }
  }

export const useCatalogStore = create((set, get) => {
  // O formulário trabalha com `category` (slug); a API espera `categoryId`.
  const withCategoryId = (data) => {
    if (!('category' in data)) return data
    const { category, ...rest } = data
    const found = get().categories.find((c) => c.slug === category || c.id === category)
    return { ...rest, categoryId: found?.id ?? null }
  }

  const replaceProduct = (id, product) =>
    set((s) => ({ products: s.products.map((p) => (p.id === id ? product : p)) }))

  return {
    ...initialShape,

    loading: false,
    loaded: false,
    error: null,

    // ---------- CARGA ----------

    /** Conteúdo público: catálogo, categorias, textos, banners, FAQ, depoimentos. */
    load: async () => {
      if (get().loading) return
      set({ loading: true, error: null })
      try {
        const [products, categories, conteudo] = await Promise.all([
          api.produtos(),
          api.categorias(),
          api.conteudo(),
        ])
        set({
          products,
          categories,
          settings: conteudo.settings,
          banners: conteudo.banners,
          faqs: conteudo.faqs,
          testimonials: conteudo.testimonials,
          loading: false,
          loaded: true,
        })
      } catch (err) {
        set({ loading: false, error: err.message })
      }
    },

    /** Painel: inclui rascunhos, pedidos e orçamentos — exige sessão. */
    loadAdmin: async () => {
      set({ loading: true, error: null })
      try {
        const [products, categories, conteudo, faqs, testimonials, orders, quotes] =
          await Promise.all([
            api.adminProdutos(),
            api.adminCategorias(),
            api.adminConteudo(),
            api.adminFaqs(),
            api.adminDepoimentos(),
            api.adminPedidos(),
            api.adminOrcamentos(),
          ])
        set({
          products,
          categories,
          settings: conteudo.settings,
          banners: conteudo.banners,
          faqs,
          testimonials,
          orders,
          quotes,
          loading: false,
          loaded: true,
        })
      } catch (err) {
        set({ loading: false, error: err.message })
        throw err
      }
    },

    // ---------- PRODUTOS ----------

    addProduct: withErrorToast(async (data) => {
      const product = await api.criarProduto(withCategoryId(data))
      set((s) => ({ products: [product, ...s.products] }))
      return product
    }),

    updateProduct: withErrorToast(async (id, data) => {
      const product = await api.atualizarProduto(id, withCategoryId(data))
      replaceProduct(id, product)
      return product
    }),

    deleteProduct: withErrorToast(async (id) => {
      await api.excluirProduto(id)
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
    }),

    duplicateProduct: withErrorToast(async (id) => {
      const copy = await api.duplicarProduto(id)
      set((s) => ({ products: [copy, ...s.products] }))
      return copy
    }),

    toggleProductStatus: withErrorToast(async (id) => {
      const current = get().products.find((p) => p.id === id)
      if (!current) return
      const status = current.status === 'published' ? 'draft' : 'published'
      replaceProduct(id, await api.atualizarProduto(id, { status }))
    }),

    toggleProductFlag: withErrorToast(async (id, flag) => {
      const current = get().products.find((p) => p.id === id)
      if (!current) return
      replaceProduct(id, await api.atualizarProduto(id, { [flag]: !current[flag] }))
    }),

    reorderProducts: withErrorToast(async (orderedIds) => {
      // Reordena localmente antes de confirmar, para a lista não "pular".
      set((s) => ({
        products: s.products
          .slice()
          .sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
          .map((p, idx) => ({ ...p, order: idx + 1 })),
      }))
      await api.reordenarProdutos(orderedIds)
    }),

    // ---------- CATEGORIAS ----------

    addCategory: withErrorToast(async (data) => {
      const category = await api.criarCategoria(data)
      set((s) => ({ categories: [...s.categories, category] }))
      return category
    }),

    updateCategory: withErrorToast(async (id, data) => {
      const category = await api.atualizarCategoria(id, data)
      set((s) => ({ categories: s.categories.map((c) => (c.id === id ? category : c)) }))
    }),

    deleteCategory: withErrorToast(async (id, force = false) => {
      await api.excluirCategoria(id, force)
      set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }))
    }),

    // ---------- DEPOIMENTOS ----------

    addTestimonial: withErrorToast(async (data) => {
      const testimonial = await api.criarDepoimento(data)
      set((s) => ({ testimonials: [testimonial, ...s.testimonials] }))
      return testimonial
    }),

    updateTestimonial: withErrorToast(async (id, data) => {
      const testimonial = await api.atualizarDepoimento(id, data)
      set((s) => ({ testimonials: s.testimonials.map((t) => (t.id === id ? testimonial : t)) }))
    }),

    deleteTestimonial: withErrorToast(async (id) => {
      await api.excluirDepoimento(id)
      set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) }))
    }),

    // ---------- FAQ ----------

    addFaq: withErrorToast(async (data) => {
      const faq = await api.criarFaq(data)
      set((s) => ({ faqs: [...s.faqs, faq] }))
      return faq
    }),

    updateFaq: withErrorToast(async (id, data) => {
      const faq = await api.atualizarFaq(id, data)
      set((s) => ({ faqs: s.faqs.map((f) => (f.id === id ? faq : f)) }))
    }),

    deleteFaq: withErrorToast(async (id) => {
      await api.excluirFaq(id)
      set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) }))
    }),

    // ---------- BANNERS E CONFIGURAÇÕES ----------

    updateHeroBanner: withErrorToast(async (data) => {
      set({ banners: await api.salvarBanners({ hero: { ...get().banners.hero, ...data } }) })
    }),

    updatePromoBanner: withErrorToast(async (data) => {
      set({ banners: await api.salvarBanners({ promo: { ...get().banners.promo, ...data } }) })
    }),

    updateCarousel: withErrorToast(async (carousel) => {
      set({ banners: await api.salvarBanners({ carousel }) })
    }),

    updateSettings: withErrorToast(async (data) => {
      set({ settings: await api.salvarConfiguracoes(data) })
    }),

    // ---------- PEDIDOS ----------

    updateOrderStatus: withErrorToast(async (id, status) => {
      const order = await api.atualizarPedido(id, { status })
      set((s) => ({ orders: s.orders.map((o) => (o.id === id ? order : o)) }))
    }),

    updateOrderTracking: withErrorToast(async (id, trackingCode) => {
      const order = await api.atualizarPedido(id, { trackingCode })
      set((s) => ({ orders: s.orders.map((o) => (o.id === id ? order : o)) }))
    }),

    // ---------- ORÇAMENTOS ----------

    /** Público — usado pelo formulário da landing page. */
    addQuote: (data) => api.criarOrcamento(data),

    updateQuoteStatus: withErrorToast(async (id, status) => {
      const quote = await api.atualizarOrcamento(id, { status })
      set((s) => ({ quotes: s.quotes.map((q) => (q.id === id ? quote : q)) }))
    }),

    deleteQuote: withErrorToast(async (id) => {
      await api.excluirOrcamento(id)
      set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) }))
    }),
  }
})
