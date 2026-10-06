// Cliente HTTP da API (Railway). Toda chamada ao backend passa por aqui.

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '')

const TOKEN_KEY = 'atelie.admin.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua internet.')
  }

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    // Token expirado: derruba a sessão do painel para o guard redirecionar.
    if (res.status === 401 && auth) clearToken()
    throw new ApiError(res.status, data?.error || 'Erro inesperado', data?.details)
  }

  return data
}

export const api = {
  // --- público ---
  produtos: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/api/produtos${qs ? `?${qs}` : ''}`)
  },
  produto: (slug) => request(`/api/produtos/${slug}`),
  categorias: () => request('/api/categorias'),
  conteudo: () => request('/api/conteudo'),

  // --- painel ---
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),

  adminProdutos: () => request('/api/admin/produtos', { auth: true }),
  criarProduto: (data) => request('/api/admin/produtos', { method: 'POST', body: data, auth: true }),
  atualizarProduto: (id, data) =>
    request(`/api/admin/produtos/${id}`, { method: 'PUT', body: data, auth: true }),
  excluirProduto: (id) => request(`/api/admin/produtos/${id}`, { method: 'DELETE', auth: true }),
  duplicarProduto: (id) =>
    request(`/api/admin/produtos/${id}/duplicar`, { method: 'POST', body: {}, auth: true }),
  reordenarProdutos: (ids) =>
    request('/api/admin/produtos/reordenar', { method: 'POST', body: { ids }, auth: true }),

  adminCategorias: () => request('/api/admin/categorias', { auth: true }),
  criarCategoria: (data) => request('/api/admin/categorias', { method: 'POST', body: data, auth: true }),
  atualizarCategoria: (id, data) =>
    request(`/api/admin/categorias/${id}`, { method: 'PUT', body: data, auth: true }),
  excluirCategoria: (id, force = false) =>
    request(`/api/admin/categorias/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      auth: true,
    }),

  adminDepoimentos: () => request('/api/admin/depoimentos', { auth: true }),
  criarDepoimento: (data) =>
    request('/api/admin/depoimentos', { method: 'POST', body: data, auth: true }),
  atualizarDepoimento: (id, data) =>
    request(`/api/admin/depoimentos/${id}`, { method: 'PUT', body: data, auth: true }),
  excluirDepoimento: (id) => request(`/api/admin/depoimentos/${id}`, { method: 'DELETE', auth: true }),

  adminFaqs: () => request('/api/admin/faqs', { auth: true }),
  criarFaq: (data) => request('/api/admin/faqs', { method: 'POST', body: data, auth: true }),
  atualizarFaq: (id, data) =>
    request(`/api/admin/faqs/${id}`, { method: 'PUT', body: data, auth: true }),
  excluirFaq: (id) => request(`/api/admin/faqs/${id}`, { method: 'DELETE', auth: true }),

  adminUsuarios: () => request('/api/admin/usuarios', { auth: true }),
  criarUsuario: (data) => request('/api/admin/usuarios', { method: 'POST', body: data, auth: true }),
  atualizarUsuario: (id, data) =>
    request(`/api/admin/usuarios/${id}`, { method: 'PUT', body: data, auth: true }),
  excluirUsuario: (id) => request(`/api/admin/usuarios/${id}`, { method: 'DELETE', auth: true }),

  adminConteudo: () => request('/api/admin/conteudo', { auth: true }),
  salvarConfiguracoes: (data) =>
    request('/api/admin/configuracoes', { method: 'PUT', body: data, auth: true }),
  salvarBanners: (data) => request('/api/admin/banners', { method: 'PUT', body: data, auth: true }),

  criarOrcamento: (data) => request('/api/orcamentos', { method: 'POST', body: data }),
  adminOrcamentos: () => request('/api/admin/orcamentos', { auth: true }),
  atualizarOrcamento: (id, data) =>
    request(`/api/admin/orcamentos/${id}`, { method: 'PATCH', body: data, auth: true }),
  excluirOrcamento: (id) => request(`/api/admin/orcamentos/${id}`, { method: 'DELETE', auth: true }),
}
