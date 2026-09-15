import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Chave da linha do carrinho: o mesmo produto em cores/tamanhos diferentes
// são itens distintos.
const lineKey = (productId, color, size) => `${productId}|${color || ''}|${size || ''}`

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Frete escolhido e CEP ficam no carrinho para o checkout reaproveitar.
      zip: '',
      shipping: null,

      addItem: ({ product, color = '', size = '', quantity = 1 }) => {
        const key = lineKey(product.id, color, size)
        const existing = get().items.find((i) => i.key === key)

        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }))
        } else {
          set((s) => ({
            items: [
              ...s.items,
              {
                key,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                // Preço guardado só para exibir; o valor cobrado é
                // sempre recalculado no servidor.
                price: product.price,
                image: product.images?.[0] ?? null,
                color,
                size,
                quantity,
              },
            ],
          }))
        }

        // Trocar o carrinho invalida a cotação anterior.
        set({ shipping: null })
      },

      updateQuantity: (key, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
          shipping: null,
        })),

      removeItem: (key) =>
        set((s) => ({ items: s.items.filter((i) => i.key !== key), shipping: null })),

      clear: () => set({ items: [], shipping: null }),

      setZip: (zip) => set({ zip, shipping: null }),
      setShipping: (shipping) => set({ shipping }),

      // Payload enxuto para a API: só id, quantidade e variação.
      toApiItems: () =>
        get().items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          ...(i.color ? { color: i.color } : {}),
          ...(i.size ? { size: i.size } : {}),
        })),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'atelie-carrinho' }
  )
)
