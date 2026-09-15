# Linha & Ponto — Ateliê de Crochê Artesanal

Landing page premium + painel administrativo completo para um negócio de produtos de crochê artesanal, construído em **React + Vite + Tailwind CSS**.

## Como rodar o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` para a vitrine pública.

O frontend precisa da API rodando. Crie um `.env` na raiz com:

```
VITE_API_URL=http://localhost:3333
```

E suba o backend em outro terminal — veja [server/README.md](server/README.md).

Para gerar a build de produção:

```bash
npm run build
npm run preview
```

## Acesso ao painel administrativo

Acesse `/admin` (redireciona automaticamente para o login).

O login é autenticado no backend (bcrypt + JWT) contra a tabela `AdminUser`.
A primeira usuária é criada pelo seed do servidor, a partir das variáveis
`SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`. Não há credencial de demonstração
no código — usuários adicionais se cadastram pelo próprio painel, em *Usuários*.

## Estrutura do projeto

```
src/
  components/
    public/     → seções e componentes da landing page (Hero, Categorias, Depoimentos, etc.)
    admin/      → Sidebar, Topbar e proteção de rotas do painel
    ui/         → componentes de interface reutilizáveis (botões, modais, tabelas, toasts, etc.)
  pages/
    public/     → Home, Loja (catálogo com filtros e busca), Detalhe do Produto, 404
    admin/      → Login, Dashboard, Produtos, Categorias, Pedidos, Depoimentos, Banners, Configurações, Usuários
  layouts/      → PublicLayout e AdminLayout
  store/        → estado global com Zustand (persistido em localStorage)
  lib/          → helpers (formatação, slugify, seed de dados iniciais)
```

## Persistência de dados

Todo o conteúdo (produtos, categorias, depoimentos, FAQ, banners, textos, pedidos, orçamentos e usuários) vive no
**Postgres**, acessado pela API em [`server/`](server/README.md). Os stores em `src/store/` são apenas cache de UI:
carregam via `load()` / `loadAdmin()` e cada ação de escrita faz a chamada HTTP correspondente.

O único dado que continua no navegador é o **carrinho** (`useCartStore`), persistido em localStorage de propósito —
para o cliente não perder os itens ao fechar a aba. Mesmo assim, preço, estoque e frete são sempre recalculados no
servidor no momento do checkout.

`src/lib/seed.js` continua no repositório com dois papéis: alimentar o banco na primeira carga
(`npm run seed` no servidor) e servir de forma inicial do estado, para os componentes não quebrarem no primeiro
render antes da API responder.

## Funcionalidades

**Landing page pública**
- Hero com CTA duplo, seção de destaques, sobre a marca, categorias, banner promocional, benefícios,
  depoimentos, FAQ e formulário de orçamento.
- Loja completa com busca, filtro por categoria, ordenação e paginação.
- Página de produto com galeria, seleção de cor/tamanho e botão direto para WhatsApp.

**Painel administrativo**
- Dashboard com métricas do catálogo e pedidos recentes.
- CRUD completo de produtos (imagens, variações, SEO, destaque, estoque, status).
- Gestão de categorias, depoimentos, usuários e pedidos/orçamentos.
- Editor de conteúdo da landing page (banner principal, banner promocional, sobre, benefícios, FAQ e CTA final)
  sem necessidade de mexer em código.
- Estados vazios, loading skeletons, modais de confirmação e notificações (toasts) em toda a interface.
