import { useRef } from 'react'
import { ImagePlus, X, Star } from 'lucide-react'
import { fileToDataUrl } from '../../lib/format'
import { notifyError } from '../../store/useToastStore'

export default function ImageUploader({ images = [], onChange, max = 6 }) {
  const inputRef = useRef(null)

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).slice(0, max - images.length)
    if (!files.length) return
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024)
    if (oversized) {
      notifyError('Cada imagem deve ter no máximo 5MB.')
      return
    }
    const urls = await Promise.all(files.map(fileToDataUrl))
    onChange([...images, ...urls])
  }

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx))
  const makeCover = (idx) => {
    const copy = [...images]
    const [chosen] = copy.splice(idx, 1)
    onChange([chosen, ...copy])
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, idx) => (
          <div key={idx} className="group relative aspect-square overflow-hidden rounded-2xl border border-espresso-700/8">
            <img src={src} alt={`Imagem ${idx + 1}`} className="h-full w-full object-cover" />
            {idx === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-espresso-700/85 px-2 py-0.5 text-[0.6rem] font-semibold text-cream-50">
                <Star size={10} fill="currentColor" /> Capa
              </span>
            )}
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-espresso-900/60 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {idx !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(idx)}
                  className="rounded-lg bg-white/90 px-2 py-1 text-[0.65rem] font-semibold text-espresso-700 hover:bg-white"
                >
                  Capa
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="ml-auto rounded-lg bg-white/90 p-1 text-terracotta-600 hover:bg-white"
                aria-label="Remover imagem"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-espresso-700/15 text-espresso-400 transition-colors hover:border-terracotta-400 hover:text-terracotta-500"
          >
            <ImagePlus size={20} />
            <span className="text-[0.65rem] font-medium">Adicionar</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-espresso-400">
        {images.length}/{max} imagens · PNG ou JPG, até 5MB cada. A primeira imagem é a capa do produto.
      </p>
    </div>
  )
}
