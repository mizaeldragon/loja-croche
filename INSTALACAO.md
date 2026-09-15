# Guia de instalação

Este documento é para quem vai **colocar a loja no ar**. Cada loja roda a
própria cópia: banco próprio, domínio próprio e — o mais importante — **conta
de pagamento própria**. O dinheiro das vendas cai direto na conta da lojista,
sem passar por ninguém no meio.

Se você é a lojista e alguém já instalou para você, pule direto para a
[parte 4](#4-conectar-pagamento-e-frete) — é a única que você precisa fazer,
e é feita pelo painel, sem mexer em código.

---

## Visão geral

São três peças:

| Peça | Onde vive | O que faz |
|---|---|---|
| Site | Vercel | O que o cliente vê: vitrine, carrinho, checkout |
| API | Railway | Regras de negócio, preços, pedidos |
| Banco | Railway (Postgres) | Guarda tudo |

O site é grátis na Vercel. A API e o banco no Railway custam alguns dólares por
mês no plano inicial — é o único custo fixo da infraestrutura, além das taxas
que Mercado Pago e Correios cobram por venda.

---

## 1. Subir o banco e a API (Railway)

1. Crie uma conta em [railway.app](https://railway.app) e um projeto novo.
2. Dentro do projeto, **New → Database → PostgreSQL**. O Railway cria o banco e
   já injeta a variável `DATABASE_URL` sozinho — você não precisa copiar nada.
3. **New → GitHub Repo** e aponte para este repositório.
4. Nas configurações do serviço, defina **Root Directory** como `server`.
   Sem isso o Railway tenta construir o site em vez da API.
5. Em **Variables**, cadastre:

   | Variável | Valor |
   |---|---|
   | `JWT_SECRET` | gere (instruções abaixo) |
   | `CREDENTIALS_KEY` | gere (instruções abaixo) |
   | `SEED_ADMIN_EMAIL` | e-mail de quem vai administrar a loja |
   | `SEED_ADMIN_PASSWORD` | uma senha forte, mínimo 10 caracteres |
   | `CORS_ORIGINS` | a URL do site na Vercel (preencha na parte 3) |
   | `PUBLIC_SITE_URL` | a URL do site na Vercel (preencha na parte 3) |
   | `NODE_ENV` | `production` |

   Para gerar os dois segredos, rode duas vezes:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   > **Guarde a `CREDENTIALS_KEY` em lugar seguro.** É ela que decifra os tokens
   > de pagamento guardados no banco. Se você perder ou trocar essa chave, a
   > lojista vai precisar colar os tokens dela de novo — nada mais quebra, mas
   > o frete e o pagamento param até isso ser feito.

6. Faça o deploy. O `railway.json` já roda as migrações do banco automaticamente
   antes de subir a API.
7. Popule o catálogo inicial, uma única vez:

   ```bash
   railway run npm run seed
   ```

8. Em **Settings → Networking**, gere o domínio público. Guarde essa URL —
   algo como `https://sua-api.up.railway.app`.

Confira se subiu certo abrindo `https://sua-api.up.railway.app/health`.
Deve responder `{"ok":true,...}`.

---

## 2. Subir o site (Vercel)

1. Em [vercel.com](https://vercel.com), importe o mesmo repositório.
2. **Root Directory**: deixe na raiz (não é `server`).
3. Em **Environment Variables**, cadastre:

   ```
   VITE_API_URL = https://sua-api.up.railway.app
   ```

4. Deploy. O `vercel.json` já cuida das rotas internas do site.

---

## 3. Ligar os dois

Volte ao Railway e preencha, agora com a URL real da Vercel:

```
CORS_ORIGINS   = https://sualoja.vercel.app
PUBLIC_SITE_URL = https://sualoja.vercel.app
```

Se você usar domínio próprio depois (`www.sualoja.com.br`), **atualize essas
duas variáveis**. `CORS_ORIGINS` aceita vários endereços separados por vírgula.

Sem isso o navegador bloqueia as chamadas do site para a API, e a loja aparece
vazia sem dar erro visível.

---

## 4. Conectar pagamento e frete

Esta parte é feita **pelo painel**, por quem é dona da loja. Nada de código,
nada de variável de ambiente.

Entre em `https://sualoja.vercel.app/admin`, faça login com o e-mail e a senha
que foram definidos na instalação, e vá em **Integrações**.

### Mercado Pago

São quatro passos, e o painel repete todos eles na tela.

1. Acesse [o painel de desenvolvedor](https://www.mercadopago.com.br/developers/panel/app)
   com a conta Mercado Pago **da loja** — é nela que o dinheiro vai cair.
2. Em **Suas integrações**, crie (ou abra) uma aplicação.
3. Em **Credenciais de produção**, copie o **Access Token**.
4. Cole no painel e clique em **Conectar Mercado Pago**. Deve aparecer
   "Conectado! Sua loja já pode receber por PIX, cartão de débito, crédito e
   boleto."

É só isso. Um campo. O checkout do Mercado Pago cuida de oferecer PIX, débito,
crédito e boleto para o cliente — não há nada para escolher ou ativar.

**Falta uma coisa fora do painel**: no Mercado Pago, vá em **Webhooks** e
cadastre a URL abaixo, marcando o evento **Pagamentos**:

```
https://sua-api.up.railway.app/api/webhooks/mercadopago
```

> Esse webhook é o que confirma o pagamento e baixa o estoque. Sem ele, os
> pedidos ficam eternamente como "pagamento pendente" mesmo depois de pagos.
> Não precisa copiar chave secreta nenhuma — o sistema confirma cada pagamento
> consultando a API do Mercado Pago, então uma notificação falsa não passa.

Antes de divulgar a loja, faça **uma compra de verdade de valor baixo** para ver
o fluxo inteiro funcionando: pagamento, pedido aparecendo como *Pago*, estoque
baixando. Depois é só estornar pelo Mercado Pago.

### Melhor Envio

1. Crie a conta em [melhorenvio.com.br](https://melhorenvio.com.br) — de novo,
   com os dados **da loja**, porque é essa conta que paga as etiquetas.
2. Para testar, crie também a conta de sandbox em
   [sandbox.melhorenvio.com.br](https://sandbox.melhorenvio.com.br).

   > **Teste e produção são contas separadas.** O token de uma não funciona na
   > outra. Se trocar o modo no painel, troque o token junto.

3. Em **Integrações → Tokens**, gere um token de API e cole no painel.

   > **Anote a data de validade.** Os tokens expiram. Quando expirar, o cálculo
   > de frete some do site sem aviso — é só gerar outro e colar de novo.

4. Preencha o **CEP de origem** (de onde as peças são postadas) e o **e-mail de
   contato** (o Melhor Envio exige para identificar a loja).
5. Clique em **Testar conexão**.

---

## 5. Antes de vender de verdade

- [ ] Trocar a senha do painel (**Usuários → editar**).
- [ ] Access Token do Mercado Pago colado e conectado, e o webhook cadastrado.
- [ ] Uma compra de verdade de valor baixo, do carrinho ao "pagamento
      confirmado", depois estornada.
- [ ] Conferir que o pedido apareceu em **Pedidos** com status **Pago**.
- [ ] **Peso e dimensões de todos os produtos.** O seed preenche estimativas por
      categoria — elas servem para o site funcionar, não para cobrar certo. Se
      estiverem erradas, o frete cobrado do cliente sai errado e o prejuízo é da
      loja. Meça cada peça **já embalada**.
- [ ] Preencher os dados reais em **Configurações** (nome, contato, endereço).
- [ ] Publicar a política de trocas e devoluções — é exigência do Código de
      Defesa do Consumidor para venda online.

---

## Perguntas comuns

**A lojista precisa mexer no Railway ou na Vercel?**
Não. Depois de instalado, tudo que ela troca — produtos, textos, tokens de
pagamento e frete — é pelo painel.

**Onde ficam guardados os tokens de pagamento?**
No banco da própria loja, cifrados com AES-256-GCM. A chave que decifra fica
na variável `CREDENTIALS_KEY`, fora do banco. Quem conseguisse um dump do
Postgres não conseguiria ler os tokens.

**Dá para uma loja ver os dados de outra?**
Não. Cada loja é uma instalação separada, com banco separado. Não existe nada
compartilhado entre elas.

**O frete parou de calcular do nada.**
Quase sempre é o token do Melhor Envio que expirou. Vá em Integrações e clique
em **Testar conexão** — a mensagem diz se é isso.

**Os pedidos ficam presos em "pagamento pendente".**
O webhook do Mercado Pago não está chegando. Confira se a URL cadastrada lá
bate exatamente com a da API e se o evento **Pagamentos** está marcado.

**Por que não tem modo de teste (sandbox) no pagamento?**
Porque quase ninguém usava, e era mais uma decisão para a lojista errar — token
de teste colado em modo produção é o erro mais comum de quem configura isso.
Uma compra real de R$ 1,00, depois estornada, testa melhor e leva um minuto.
