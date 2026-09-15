-- Simplifica a configuração do Mercado Pago para um campo só.
--
-- O Access Token de produção basta: o Checkout Pro já entrega PIX, débito,
-- crédito e boleto. A chave de assinatura do webhook virou redundante porque
-- a rota consulta o pagamento na API do Mercado Pago em vez de confiar no
-- corpo da notificação (ver src/routes/webhooks.js).
ALTER TABLE "Integration" DROP COLUMN IF EXISTS "mpWebhookSecret";
ALTER TABLE "Integration" DROP COLUMN IF EXISTS "mpMode";
