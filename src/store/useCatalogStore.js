import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  seedCategories,
  seedProducts,
  seedTestimonials,
  seedFaqs,
  seedBanners,
  seedSettings,
  seedOrders,
} from '../lib/seed'
import { uid, slugify } from '../lib/format'

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      categories: seedCategories,
      products: seedProducts,
      testimonials: seedTestimonials,
      faqs: seedFaqs,
      banners: seedBanners,
      settings: seedSettings,
      orders: seedOrders,

      // ---------- PRODUCTS ----------
      addProduct: (data) => {
        const id = uid('prod')
        const slug = slugify(data.name || 'produto') + '-' + id.slice(-4)
        const product = {
          id,
          slug,
          images: [],
          colors: [],
          sizes: [],
          tags: [],
          status: 'draft',
          featured: false,
          bestseller: false,
          isNew: true,
          stock: 0,
          order: get().products.length + 1,
          createdAt: new Date().toISOString(),
          ...data,
        }
        set((s) => ({ products: [product, ...s.products] }))
        return product
      },
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      duplicateProduct: (id) => {
        const original = get().products.find((p) => p.id === id)
        if (!original) return
        const newId = uid('prod')
        const copy = {
          ...original,
          id: newId,
          name: `${original.name} (Cópia)`,
          slug: `${original.slug}-copia-${newId.slice(-4)}`,
          status: 'draft',
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ products: [copy, ...s.products] }))
      },
      toggleProductStatus: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p
          ),
        })),
      toggleProductFlag: (id, flag) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, [flag]: !p[flag] } : p)),
        })),
      reorderProducts: (orderedIds) =>
        set((s) => ({
          products: s.products
            .slice()
            .sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
            .map((p, idx) => ({ ...p, order: idx + 1 })),
        })),

      // ---------- CATEGORIES ----------
      addCategory: (data) => {
        const id = uid('cat')
        const slug = slugify(data.name || 'categoria')
        set((s) => ({
          categories: [...s.categories, { id, slug, order: s.categories.length + 1, ...data }],
        }))
      },
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // ---------- TESTIMONIALS ----------
      addTestimonial: (data) =>
        set((s) => ({ testimonials: [{ id: uid('test'), rating: 5, ...data }, ...s.testimonials] })),
      updateTestimonial: (id, data) =>
        set((s) => ({
          testimonials: s.testimonials.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      deleteTestimonial: (id) =>
        set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) })),

      // ---------- FAQS ----------
      addFaq: (data) => set((s) => ({ faqs: [...s.faqs, { id: uid('faq'), ...data }] })),
      updateFaq: (id, data) =>
        set((s) => ({ faqs: s.faqs.map((f) => (f.id === id ? { ...f, ...data } : f)) })),
      deleteFaq: (id) => set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) })),

      // ---------- BANNERS ----------
      updateHeroBanner: (data) =>
        set((s) => ({ banners: { ...s.banners, hero: { ...s.banners.hero, ...data } } })),
      updatePromoBanner: (data) =>
        set((s) => ({ banners: { ...s.banners, promo: { ...s.banners.promo, ...data } } })),

      // ---------- SETTINGS ----------
      updateSettings: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),

      // ---------- ORDERS ----------
      addOrder: (data) =>
        set((s) => ({
          orders: [
            { id: uid('ord'), status: 'novo', createdAt: new Date().toISOString(), ...data },
            ...s.orders,
          ],
        })),
      updateOrderStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),

      // ---------- RESET ----------
      resetToSeed: () =>
        set({
          categories: seedCategories,
          products: seedProducts,
          testimonials: seedTestimonials,
          faqs: seedFaqs,
          banners: seedBanners,
          settings: seedSettings,
          orders: seedOrders,
        }),
    }),
    {
      name: 'atelie-linha-e-ponto:catalog',
      version: 11,
      migrate: (persistedState, version) => {
        if (version < 9) {
          return {
            ...persistedState,
            categories: seedCategories,
            products: seedProducts,
            testimonials: seedTestimonials,
            faqs: seedFaqs,
            banners: {
              ...seedBanners,
              ...(persistedState?.banners || {}),
              hero: {
                ...(persistedState?.banners?.hero || {}),
                ...seedBanners.hero,
                image: `${seedBanners.hero.image}?v=9`,
              },
            },
            settings: {
              ...seedSettings,
              ...(persistedState?.settings || {}),
              siteName: seedSettings.siteName,
              tagline: seedSettings.tagline,
              aboutText: seedSettings.aboutText,
            },
            orders: seedOrders,
          }
        }
        if (version < 11) {
          return {
            ...persistedState,
            categories: seedCategories,
            testimonials: seedTestimonials,
            faqs: seedFaqs,
            banners: {
              ...seedBanners,
              hero: {
                ...seedBanners.hero,
                image: persistedState?.banners?.hero?.image || seedBanners.hero.image,
              },
            },
            settings: {
              ...persistedState?.settings,
              ...seedSettings,
              email: persistedState?.settings?.email || seedSettings.email,
              phone: persistedState?.settings?.phone || seedSettings.phone,
              whatsapp: persistedState?.settings?.whatsapp || seedSettings.whatsapp,
              instagram: persistedState?.settings?.instagram || seedSettings.instagram,
              address: persistedState?.settings?.address || seedSettings.address,
            },
          }
        }
        return persistedState
      },
    }
  )
)
