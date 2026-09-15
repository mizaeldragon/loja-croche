import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ShieldCheck, Truck, Sparkles, MessageCircle, Check, ShoppingBag } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import { useCartStore } from '../../store/useCartStore'
import ShippingCalculator from '../../components/public/ShippingCalculator'
import { formatCurrency } from '../../lib/format'
import ProductCard from '../../components/public/ProductCard'
import EmptyState from '../../components/ui/EmptyState'
import { PackageX } from 'lucide-react'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const products = useCatalogStore((s) => s.products)
  const settings = useCatalogStore((s) => s.settings)
  const product = products.find((p) => p.slug === slug && p.status === 'published')

  const addItem = useCartStore((s) => s.addItem)
  const zip = useCartStore((s) => s.zip)
  const setZip = useCartStore((s) => s.setZip)

  const [activeImage, setActiveImage] = useState(0)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (product) {
      setActiveImage(0)
      setColor(product.colors?.[0] || '')
      setSize(product.sizes?.[0] || '')
    }
  }, [product?.id])

  if (!product) {
    return (
      <div className="bg-white py-24">
        <div className="container-page">
          <EmptyState
            icon={PackageX}
            title="Produto não encontrado"
            description="Essa peça pode ter sido removida ou o link está incorreto."
            action={
              <Link to="/loja" className="btn-primary btn-sm">
                Voltar para a loja
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const hasPromo = product.promoPrice && product.promoPrice < product.price
  const outOfStock = product.stock === 0

  function handleAddToCart() {
    addItem({
      product: { ...product, price: hasPromo ? product.promoPrice : product.price },
      color,
      size,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.status === 'published')
    .slice(0, 4)

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho interesse na peça "${product.name}"${color ? ` (cor: ${color})` : ''}${size ? ` (tamanho: ${size})` : ''}. Poderiam me passar mais informações?`
  )

  return (
    <div className="bg-white py-10 sm:py-14">
      <div className="container-page">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-500 hover:text-espresso-700"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="mb-4 overflow-hidden rounded-3xl border border-espresso-700/8 bg-sand-100">
              <img
                src={product.images?.[activeImage]}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                      activeImage === i ? 'border-terracotta-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="animate-fadeUp">
            <p className="eyebrow">{product.tags?.[0] || 'Peça artesanal'}</p>
            <h1 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl">{product.name}</h1>

            <div className="mt-5 flex items-baseline gap-3">
              {hasPromo ? (
                <>
                  <span className="font-display text-3xl text-espresso-800">{formatCurrency(product.promoPrice)}</span>
                  <span className="text-base text-espresso-400 line-through">{formatCurrency(product.price)}</span>
                </>
              ) : (
                <span className="font-display text-3xl text-espresso-800">{formatCurrency(product.price)}</span>
              )}
            </div>

            <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-espresso-500">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="mt-7">
                <p className="label-field">Cor</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`chip transition-colors ${
                        color === c ? '!border-terracotta-500 !bg-terracotta-400/15 !text-espresso-800' : ''
                      }`}
                    >
                      {color === c && <Check size={12} />} {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mt-5">
                <p className="label-field">Tamanho</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors ${
                        size === s
                          ? 'border-terracotta-500 bg-terracotta-400/15 text-espresso-800'
                          : 'border-espresso-700/12 text-espresso-600 hover:border-espresso-700/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="btn-primary btn-lg flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {outOfStock ? (
                  'Esgotado'
                ) : added ? (
                  <>
                    <Check size={17} /> Adicionado!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={17} /> Adicionar ao carrinho
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary btn-lg flex-1"
              >
                <MessageCircle size={17} /> Falar no WhatsApp
              </a>
            </div>

            {!outOfStock && (
              <div className="mt-6">
                <ShippingCalculator
                  items={[{ productId: product.id, quantity: 1 }]}
                  zip={zip}
                  onZipChange={setZip}
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-espresso-700/8 pt-6">
              <div className="flex items-center gap-2 text-sm text-espresso-500">
                <ShieldCheck size={16} className="text-espresso-700" /> Feito à mão sob encomenda
              </div>
              <div className="flex items-center gap-2 text-sm text-espresso-500">
                <Truck size={16} className="text-espresso-700" /> Envio cuidadoso
              </div>
              <div className="flex items-center gap-2 text-sm text-espresso-500">
                <Sparkles size={16} className="text-espresso-700" /> Peça exclusiva
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8 font-display text-2xl text-espresso-800">Você também pode gostar</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
