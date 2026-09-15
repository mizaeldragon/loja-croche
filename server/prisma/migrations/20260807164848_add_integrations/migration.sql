-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "mpAccessToken" TEXT,
    "mpWebhookSecret" TEXT,
    "mpMode" TEXT NOT NULL DEFAULT 'sandbox',
    "meToken" TEXT,
    "meMode" TEXT NOT NULL DEFAULT 'sandbox',
    "meContactEmail" TEXT,
    "shipFromZip" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);
