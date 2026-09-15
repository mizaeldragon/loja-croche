// Erro de aplicação com status HTTP — o handler global converte em resposta JSON.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const badRequest = (msg, details) => new HttpError(400, msg, details)
export const unauthorized = (msg = 'Não autenticado') => new HttpError(401, msg)
export const forbidden = (msg = 'Sem permissão') => new HttpError(403, msg)
export const notFound = (msg = 'Não encontrado') => new HttpError(404, msg)

// Envolve handlers async para que rejeições cheguem ao error handler
// do Express (que no v4 não captura promises sozinho).
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// Valida body/query com um schema Zod e devolve os dados já tipados.
export function parse(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw badRequest(
      'Dados inválidos',
      result.error.issues.map((i) => ({ campo: i.path.join('.'), erro: i.message }))
    )
  }
  return result.data
}
