-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "message" SET DEFAULT '';
