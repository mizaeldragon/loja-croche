# Guia de instalação

Este documento é para quem vai **colocar o site no ar**. Cada instalação roda a
própria cópia: banco próprio e domínio próprio.

---

## Visão geral

São três peças:

| Peça | Onde vive | O que faz |
|---|---|---|
| Site | Vercel | O que o cliente vê: landing page e vitrine de produtos |
| API | Railway | Conteúdo do site, catálogo, orçamentos e login do painel |
| Banco | Railway (Postgres) | Guarda tudo |

O site é grátis na Vercel. A API e o banco no Railway custam alguns dólares por
mês no plano inicial — é o único custo fixo da infraestrutura.

Não há venda online: o cliente conhece as peças no site e fecha a compra pelo
WhatsApp ou pelo formulário de orçamento, que cai no painel em **Orçamentos**.

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
   | `SEED_ADMIN_EMAIL` | e-mail de quem vai administrar o site |
   | `SEED_ADMIN_PASSWORD` | uma senha forte, mínimo 10 caracteres |
   | `CORS_ORIGINS` | a URL do site na Vercel (preencha na parte 3) |
   | `NODE_ENV` | `production` |

   Para gerar o `JWT_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Faça o deploy. O `railway.json` já roda as migrações do banco automaticamente
   antes de subir a API.
7. Popule o catálogo inicial, uma única vez:

   ```bash
   railway run npm run seed
   ```

8. Em **Settings → Networking**, gere o domínio público. Guarde essa URL —
   algo como `https://sua-api.up.railway.app`.

Confira se subiu certo abrindo `https://sua-api.up.railway.app/health`.
Deve responder `{"ok":true}`.

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
CORS_ORIGINS = https://seusite.vercel.app
```

Se você usar domínio próprio depois (`www.seusite.com.br`), **atualize essa
variável**. Ela aceita vários endereços separados por vírgula.

Sem isso o navegador bloqueia as chamadas do site para a API, e o site aparece
vazio sem dar erro visível.

---

## 4. Antes de divulgar

- [ ] Trocar a senha do painel (**Usuários → editar**).
- [ ] Preencher os dados reais em **Configurações** (nome, WhatsApp, e-mail,
      endereço) — o botão "Comprar agora" dos produtos abre o WhatsApp
      cadastrado ali.
- [ ] Cadastrar os produtos e categorias reais e despublicar os de exemplo.
- [ ] Enviar um orçamento de teste pelo formulário do site e conferir que ele
      aparece em **Orçamentos**.

---

## Perguntas comuns

**A dona do site precisa mexer no Railway ou na Vercel?**
Não. Depois de instalado, tudo que ela troca — produtos, textos, banners,
depoimentos — é pelo painel.

**Dá para uma instalação ver os dados de outra?**
Não. Cada instalação é separada, com banco separado. Não existe nada
compartilhado entre elas.
