export function TextField({ label, hint, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label-field">{label}</label>}
      <input className="input-field" {...props} />
      {hint && !error && <p className="mt-1 text-xs text-espresso-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-terracotta-600">{error}</p>}
    </div>
  )
}

export function TextAreaField({ label, hint, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="label-field">{label}</label>}
      <textarea className="input-field min-h-[110px] resize-y" {...props} />
      {hint && !error && <p className="mt-1 text-xs text-espresso-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-terracotta-600">{error}</p>}
    </div>
  )
}

export function SelectField({ label, hint, error, className = '', children, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label-field">{label}</label>}
      <select className="input-field" {...props}>
        {children}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-espresso-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-terracotta-600">{error}</p>}
    </div>
  )
}

export function ToggleField({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-espresso-700/8 bg-white px-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-espresso-700">{label}</p>
        {description && <p className="text-xs text-espresso-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-terracotta-500' : 'bg-espresso-700/15'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  )
}

export function TagInput({ label, hint, values = [], onChange, placeholder }) {
  const add = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const val = e.target.value.trim().replace(/,$/, '')
    if (val && !values.includes(val)) onChange([...values, val])
    e.target.value = ''
  }
  const remove = (v) => onChange(values.filter((x) => x !== v))
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <div className="input-field flex min-h-[44px] flex-wrap items-center gap-1.5 py-2">
        {values.map((v) => (
          <span key={v} className="chip bg-terracotta-400/10 text-espresso-700">
            {v}
            <button type="button" onClick={() => remove(v)} className="text-espresso-400 hover:text-terracotta-600">
              ×
            </button>
          </span>
        ))}
        <input
          onKeyDown={add}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 border-none bg-transparent p-0 text-sm outline-none placeholder:text-espresso-400"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-espresso-400">{hint}</p>}
    </div>
  )
}
