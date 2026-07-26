import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sand-100 text-espresso-700">
        <Compass size={28} strokeWidth={1.5} />
      </div>
      <p className="font-display text-6xl text-espresso-800">404</p>
      <h1 className="mt-3 font-display text-2xl text-espresso-800">Página não encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-espresso-500">
        A página que você procura pode ter sido movida ou não existe mais.
      </p>
      <Link to="/" className="btn-primary btn-md mt-8">
        Voltar ao início
      </Link>
    </div>
  )
}
