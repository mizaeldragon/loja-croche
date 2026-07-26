import { TriangleAlert } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Essa ação não poderá ser desfeita.',
  confirmLabel = 'Excluir',
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            danger ? 'bg-terracotta-600/10 text-terracotta-600' : 'bg-terracotta-400/10 text-terracotta-500'
          }`}
        >
          <TriangleAlert size={26} />
        </div>
        <h3 className="mb-2 font-display text-xl text-espresso-800">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-espresso-500">{description}</p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="btn-secondary btn-md flex-1">
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm?.()
              onClose?.()
            }}
            className={`btn-md flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
