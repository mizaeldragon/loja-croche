// Todo dinheiro trafega internamente em CENTAVOS (inteiro).
// Float com centavos acumula erro: 0.1 + 0.2 !== 0.3.

export const toCents = (value) => {
  const n = typeof value === 'string' ? Number(value) : Number(value ?? 0)
  if (!Number.isFinite(n)) throw new Error(`Valor monetário inválido: ${value}`)
  return Math.round(n * 100)
}

export const fromCents = (cents) => Math.round(cents) / 100

// Prisma devolve Decimal; converte para centavos sem passar por float.
export const decimalToCents = (decimal) => toCents(decimal.toString())

export const formatBRL = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
