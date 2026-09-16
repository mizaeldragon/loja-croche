-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "mpFee" DECIMAL(10,2),
ADD COLUMN     "netReceived" DECIMAL(10,2);
