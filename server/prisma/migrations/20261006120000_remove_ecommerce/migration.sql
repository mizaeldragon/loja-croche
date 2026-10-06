-- Remove a parte de e-commerce: o site passa a ser landing page + painel.
-- ATENÇÃO: apaga pedidos, clientes, endereços e as credenciais de Mercado Pago
-- e Melhor Envio. Faça backup do banco antes de rodar em produção.

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "ShippingAddress" DROP CONSTRAINT "ShippingAddress_orderId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "heightCm",
DROP COLUMN "lengthCm",
DROP COLUMN "weightGrams",
DROP COLUMN "widthCm";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "ShippingAddress";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "DeliverySettings";

-- DropTable
DROP TABLE "WebhookEvent";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

