import { Link } from 'react-router-dom'
import { Package, Sparkles, Tags, ClipboardList, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatCurrency, formatDate } from '../../lib/format'

export default function Dashboard() {
  usePageHeader('Dashboard', 'Visão geral do seu ateliê')

  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const orders = useCatalogStore((s) => s.orders)
  const quotes = useCatalogStore((s) => s.quotes)

  const published = products.filter((p) => p.status === 'published')
  const pagos = orders.filter((o) => o.paymentStatus === 'pago')
  // Vendido != recebido. A taxa do Mercado Pago sai do meio, e no
  // parcelamento com juros por conta da loja a diferença é grande.
  const vendido = pagos.reduce((sum, o) => sum + o.total, 0)
  const recebido = pagos.reduce((sum, o) => sum + (o.netReceived ?? 0), 0)
  // Pedidos antigos podem não ter o líquido registrado; nesse caso não
  // fingimos saber e mostramos apenas o vendido.
  const temLiquido = pagos.some((o) => o.netReceived != null)
  const featured = products.filter((p) => p.featured)
  const lowStock = products.filter((p) => p.stock <= 3 && p.status === 'published')
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const topProducts = [...products].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total de produtos" value={products.length} trend={`${published.length} publicados`} tone="caramel" />
        <StatCard icon={Sparkles} label="Produtos em destaque" value={featured.length} trend="Vitrine da home" />
        <StatCard icon={Tags} label="Categorias cadastradas" value={categories.length} />
        <StatCard
          icon={ClipboardList}
          label="Pedidos"
          value={orders.length}
          trend={
            temLiquido
              ? `${formatCurrency(recebido)} líquidos de ${formatCurrency(vendido)} vendidos`
              : `${formatCurrency(vendido)} vendidos · ${quotes.length} orçamentos`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white/80 p-0 shadow-card backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between p-6 pb-2">
            <div>
              <h3 className="font-display text-lg text-espresso-800">Pedidos recentes</h3>
              <p className="text-xs text-espresso-400">Últimas solicitações recebidas</p>
            </div>
            <Link to="/admin/pedidos" className="btn-ghost btn-sm">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-1 px-3 pb-3">
            {recentOrders.length === 0 && (
              <p className="p-3 text-sm text-espresso-400">Nenhum pedido registrado ainda.</p>
            )}
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 rounded-2xl px-3 py-3 hover:bg-sand-50/60">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-espresso-800">
                    #{o.number} · {o.customer?.name}
                  </p>
                  <p className="truncate text-xs text-espresso-400">
                    {o.items?.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-espresso-400">{formatDate(o.createdAt)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-card backdrop-blur-sm">
          <h3 className="mb-1 font-display text-lg text-espresso-800">Ações rápidas</h3>
          <p className="mb-5 text-xs text-espresso-400">Gerencie seu catálogo em poucos cliques</p>
          <div className="space-y-2.5">
            <Link to="/admin/produtos/novo" className="btn-primary btn-md w-full !justify-start">
              <Plus size={16} /> Novo produto
            </Link>
            <Link to="/admin/categorias" className="btn-secondary btn-md w-full !justify-start bg-white hover:bg-white">
              <Tags size={16} /> Gerenciar categorias
            </Link>
            <Link to="/admin/banners" className="btn-secondary btn-md w-full !justify-start bg-white hover:bg-white">
              <Sparkles size={16} /> Editar conteúdo da home
            </Link>
          </div>

          {lowStock.length > 0 && (
            <div className="mt-6 rounded-2xl bg-terracotta-600/5 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-600">
                <TrendingUp size={13} /> Estoque baixo
              </p>
              <ul className="mt-2 space-y-1">
                {lowStock.slice(0, 3).map((p) => (
                  <li key={p.id} className="truncate text-xs text-espresso-600">
                    {p.name} — {p.stock} un.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-between p-6 pb-2">
          <div>
            <h3 className="font-display text-lg text-espresso-800">Produtos em destaque no catálogo</h3>
            <p className="text-xs text-espresso-400">Mais vendidos e novidades</p>
          </div>
          <Link to="/admin/produtos" className="btn-ghost btn-sm">
            Gerenciar produtos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2 lg:grid-cols-5">
          {topProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-sand-50/60">
              <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-espresso-800">{p.name}</p>
                <p className="text-xs text-espresso-400">{formatCurrency(p.promoPrice || p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
