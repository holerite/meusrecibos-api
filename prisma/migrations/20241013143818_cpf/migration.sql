/*
  Warnings:

  - You are about to drop the column `payday` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `validity` on the `Receipts` table. All the data in the column will be lost.
  - Added the required column `FGTS` to the `Receipts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `IRRF` to the `Receipts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "admission" DATETIME;
ALTER TABLE "Employee" ADD COLUMN "cbo" TEXT;
ALTER TABLE "Employee" ADD COLUMN "position" TEXT;

-- CreateTable
CREATE TABLE "ReceiptDetails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference" REAL NOT NULL,
    "salary" INTEGER NOT NULL,
    "discounts" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" TEXT NOT NULL,
    "baseWage" INTEGER,
    "contributionSalaryINSS" INTEGER,
    "baseSalaryFGTS" INTEGER,
    "FGTS" INTEGER NOT NULL,
    "IRRF" INTEGER NOT NULL,
    "totalWage" INTEGER,
    "liquidWage" INTEGER,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("companyId", "employeeId", "id", "opened", "receiptsTypesId") SELECT "companyId", "employeeId", "id", "opened", "receiptsTypesId" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
