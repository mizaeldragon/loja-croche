# API — Ateliê Angel Art

Backend da landing page e do painel: conteúdo do site, catálogo, orçamentos e
login. Node + Express + Prisma + Postgres, feito para rodar no Railway.

## Rodar localmente

```bash
cd server
npm install
cp .env.example .env    # preencha os valores
npx prisma migrate dev
npm run seed            # migra o catálogo de src/lib/seed.js para o banco
npm run dev
```

A API sobe em `http://localhost:3333`. Confira em `/health`.

Para o frontend enxergar a API, crie um `.env` na raiz do projeto com:

```
VITE_API_URL=http://localhost:3333
```

## Variáveis de ambiente

Todas descritas em `.env.example`. As obrigatórias para o servidor subir são
`DATABASE_URL` e `JWT_SECRET`.

Gere o segredo com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploy

O passo a passo completo — Railway e Vercel — está em
[INSTALACAO.md](../INSTALACAO.md), na raiz do repositório.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | status do banco |
| GET | `/api/produtos` | catálogo publicado (`?categoria=`, `?busca=`, `?destaque=`) |
| GET | `/api/produtos/:slug` | detalhe do produto |
| GET | `/api/categorias` | categorias |
| GET | `/api/conteudo` | textos, banners, FAQ e depoimentos do site |
| POST | `/api/orcamentos` | formulário de orçamento da landing page |
| POST | `/api/auth/login` | login do painel |
| GET | `/api/auth/me` | usuária autenticada |
| GET/POST/PUT/DELETE | `/api/admin/produtos` | CRUD de produtos (autenticado) |
| GET/POST/PUT/DELETE | `/api/admin/categorias`, `/depoimentos`, `/faqs`, `/usuarios` | demais cadastros do painel |
| GET/PUT | `/api/admin/conteudo`, `/configuracoes`, `/banners` | conteúdo editorial do site |
| GET/PATCH/DELETE | `/api/admin/orcamentos` | gestão de orçamentos (autenticado) |
