export default function StatCard({ icon: Icon, label, value, trend, tone = 'default' }) {
  const isAccent = tone === 'caramel' || tone === 'accent'
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-3xl p-5 shadow-card ${
        isAccent
          ? 'bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-cream-50'
          : 'bg-white/80 text-espresso-700 backdrop-blur-sm'
      }`}
    >
      <div>
        <p className={`text-xs font-medium uppercase tracking-wide ${isAccent ? 'text-cream-50/80' : 'text-espresso-400'}`}>
          {label}
        </p>
        <p className="mt-1.5 font-display text-2xl">{value}</p>
        {trend && (
          <p className={`mt-1.5 text-xs font-medium ${isAccent ? 'text-cream-50/90' : 'text-emerald-700'}`}>
            {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            isAccent ? 'bg-white/20' : 'bg-sand-100 text-terracotta-500'
          }`}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
  )
}
