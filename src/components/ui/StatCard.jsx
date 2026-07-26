export default function StatCard({ icon: Icon, label, value, trend, tone = 'default' }) {
  const isCaramel = tone === 'caramel'
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-3xl p-5 shadow-card ${
        isCaramel
          ? 'bg-gradient-to-br from-caramel-400 to-caramel-600 text-cream-50'
          : 'border border-espresso-700/[0.06] bg-white text-espresso-700'
      }`}
    >
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${isCaramel ? 'text-cream-50/80' : 'text-espresso-400'}`}>
          {label}
        </p>
        <p className="mt-1.5 font-display text-2xl">{value}</p>
        {trend && (
          <p className={`mt-1.5 text-xs font-medium ${isCaramel ? 'text-cream-50/90' : 'text-emerald-700'}`}>
            {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isCaramel ? 'bg-white/20' : 'bg-sand-100 text-caramel-500'
          }`}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
  )
}
