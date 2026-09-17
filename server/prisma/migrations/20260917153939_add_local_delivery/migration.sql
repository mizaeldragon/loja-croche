-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingType" TEXT NOT NULL DEFAULT 'transportadora';

-- CreateTable
CREATE TABLE "DeliverySettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "localCity" TEXT,
    "localState" TEXT,
    "localEnabled" BOOLEAN NOT NULL DEFAULT false,
    "localLabel" TEXT NOT NULL DEFAULT 'Entrega local',
    "localPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "localDays" INTEGER NOT NULL DEFAULT 2,
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pickupLabel" TEXT NOT NULL DEFAULT 'Retirada combinada',
    "pickupInstructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySettings_pkey" PRIMARY KEY ("id")
);
