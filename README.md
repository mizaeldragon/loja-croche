# Linha & Ponto — Ateliê de Crochê Artesanal

Landing page premium + painel administrativo completo para um negócio de produtos de crochê artesanal, construído em **React + Vite + Tailwind CSS**.

## Como rodar o projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` para a vitrine pública.

Para gerar a build de produção:

```bash
npm run build
npm run preview
```

## Acesso ao painel administrativo

Acesse `/admin` (redireciona automaticamente para o login).

- **URL:** `http://localhost:5173/admin/login`
- **E-mail:** `admin@linhaeponto.com`
- **Senha:** `crochedelicado`

Também existe um usuário de nível "editor": `editor@linhaeponto.com` / `editor123`.

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

Este projeto não possui backend: todo o catálogo (produtos, categorias, depoimentos, banners, pedidos, usuários) é
gerenciado com **Zustand + localStorage**, o que permite testar o fluxo completo de CRUD do painel administrativo
sem necessidade de servidor. Para conectar a uma API real, substitua as actions dentro de `src/store/` por chamadas
HTTP mantendo a mesma assinatura de funções usada pelos componentes.

Em "Configurações → Zona de manutenção" é possível restaurar os dados de demonstração originais a qualquer momento.

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
