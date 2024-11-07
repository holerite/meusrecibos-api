-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "refresh_token" TEXT;
ALTER TABLE "Employee" ADD COLUMN "refresh_token_expires_at" DATETIME;
