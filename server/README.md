# API — Ateliê Angel Art

Backend do e-commerce: catálogo, pedidos, cálculo de frete (Melhor Envio) e
pagamentos (Mercado Pago). Node + Express + Prisma + Postgres, feito para rodar
no Railway.

## Rodar localmente

```bash
cd server
npm install
cp .env.example .env    # preencha os valores
npx prisma migrate dev --name init
npm run seed            # migra o catálogo de src/lib/seed.js para o banco
npm run dev
```

A API sobe em `http://localhost:3333`. Confira em `/health` — ele mostra quais
integrações estão configuradas.

Para o frontend enxergar a API, crie um `.env` na raiz do projeto com:

```
VITE_API_URL=http://localhost:3333
```

## Variáveis de ambiente

Todas descritas em `.env.example`. Só entra aqui o que é da **infraestrutura**.
As obrigatórias para o servidor subir são `DATABASE_URL`, `JWT_SECRET` e
`CREDENTIALS_KEY`.

Gere os dois segredos com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Enquanto as integrações não estiverem configuradas no painel, o checkout e o
cálculo de frete respondem 503 com uma mensagem explicando o que falta. O resto
da API funciona normalmente — dá para montar o catálogo antes de ter as contas
de pagamento e envio prontas.

## Credenciais das integrações

**Não ficam aqui.** Mercado Pago e Melhor Envio são configurados pela lojista
no painel, em *Integrações*, e guardados cifrados (AES-256-GCM) na tabela
`Integration`. A chave que decifra é a `CREDENTIALS_KEY` do ambiente.

O motivo: cada instalação pertence a uma loja diferente, que recebe o próprio
dinheiro. Ela precisa poder trocar um token expirado sem depender de quem
instalou e sem um redeploy.

## Deploy

O passo a passo completo — Railway, Vercel, contas de pagamento e frete — está
em [INSTALACAO.md](../INSTALACAO.md), na raiz do repositório.

## Decisões que valem conhecer

- **Preço nunca vem do cliente.** O carrinho envia só `productId` e quantidade;
  preço, peso e dimensões saem do banco (`src/services/cart.js`). Isso impede
  alguém de editar o valor no DevTools e pagar R$ 1,00.
- **O frete é recotado no checkout.** O cliente escolhe o *serviço*; o preço vem
  sempre de uma cotação nova feita no servidor.
- **Dinheiro em centavos.** Internamente tudo é inteiro (`src/lib/money.js`) e o
  banco usa `Decimal(10,2)`. Float com centavos acumula erro.
- **Webhook idempotente.** O Mercado Pago reenvia a mesma notificação várias
  vezes; a tabela `WebhookEvent` garante que o estoque só é baixado uma vez.
- **A notificação não é confiável.** Ao receber o webhook, consultamos o
  pagamento na API do MP em vez de acreditar no corpo da requisição.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | status do banco e das integrações |
| GET | `/api/produtos` | catálogo publicado (`?categoria=`, `?busca=`, `?destaque=`) |
| GET | `/api/produtos/:slug` | detalhe do produto |
| GET | `/api/categorias` | categorias |
| GET | `/api/conteudo` | textos, banners, FAQ e depoimentos do site |
| GET | `/api/cep/:cep` | consulta de endereço (proxy do ViaCEP) |
| POST | `/api/frete` | cotação de entrega |
| POST | `/api/checkout` | cria o pedido e devolve a URL de pagamento |
| GET | `/api/pedidos/:id/status` | status público do pedido |
| POST | `/api/webhooks/mercadopago` | notificação de pagamento |
| GET/PUT | `/api/admin/integracoes` | credenciais de pagamento e frete (só admin) |
| POST | `/api/admin/integracoes/testar-*` | valida as credenciais sem cobrar nada |
| POST | `/api/auth/login` | login do painel |
| GET | `/api/auth/me` | usuária autenticada |
| GET/POST/PUT/DELETE | `/api/admin/produtos` | CRUD de produtos (autenticado) |
| GET/PATCH | `/api/admin/pedidos` | gestão de pedidos (autenticado) |
| GET | `/api/admin/metricas` | números do dashboard |
