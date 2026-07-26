export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-espresso-700/15 bg-sand-50/40 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-caramel-500 shadow-soft">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="mb-1.5 font-display text-lg text-espresso-800">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-espresso-500">{description}</p>}
      {action}
    </div>
  )
}
