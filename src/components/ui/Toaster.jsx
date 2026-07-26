import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/useToastStore'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const STYLES = {
  success: 'border-emerald-700/15 text-emerald-800 [&_svg]:text-emerald-600',
  error: 'border-terracotta-600/20 text-terracotta-700 [&_svg]:text-terracotta-600',
  info: 'border-espresso-700/15 text-espresso-700 [&_svg]:text-caramel-500',
}

export default function Toaster() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6 sm:items-end sm:px-6">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white/95 px-4 py-3.5 shadow-lift backdrop-blur animate-fadeUp ${STYLES[t.type] || STYLES.info}`}
            role="status"
          >
            <Icon size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-full p-0.5 text-espresso-400 hover:bg-espresso-700/5 hover:text-espresso-700"
              aria-label="Fechar notificação"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
