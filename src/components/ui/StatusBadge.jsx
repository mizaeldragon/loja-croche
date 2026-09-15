const STYLES = {
  published: 'bg-emerald-700/10 text-emerald-800',
  draft: 'bg-espresso-700/8 text-espresso-500',
  novo: 'bg-terracotta-400/15 text-terracotta-600',
  em_andamento: 'bg-gold-400/15 text-gold-500',
  enviado: 'bg-sky-700/10 text-sky-800',
  concluido: 'bg-emerald-700/10 text-emerald-800',
  cancelado: 'bg-terracotta-600/10 text-terracotta-600',
  ativo: 'bg-emerald-700/10 text-emerald-800',
  inativo: 'bg-espresso-700/8 text-espresso-500',
  // pagamento
  pendente: 'bg-amber-500/15 text-amber-700',
  pago: 'bg-emerald-700/10 text-emerald-800',
  recusado: 'bg-red-600/10 text-red-700',
  estornado: 'bg-espresso-700/8 text-espresso-500',
  // orçamentos
  respondido: 'bg-sky-700/10 text-sky-800',
  fechado: 'bg-espresso-700/8 text-espresso-500',
}

const LABELS = {
  published: 'Publicado',
  draft: 'Rascunho',
  novo: 'Novo',
  em_andamento: 'Em andamento',
  enviado: 'Enviado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  ativo: 'Ativo',
  inativo: 'Inativo',
  pendente: 'Pagamento pendente',
  pago: 'Pago',
  recusado: 'Pagamento recusado',
  estornado: 'Estornado',
  respondido: 'Respondido',
  fechado: 'Fechado',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
        STYLES[status] || STYLES.draft
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  )
}
