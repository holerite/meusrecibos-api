/*
  Warnings:

  - You are about to alter the column `receiptsTypesId` on the `Receipts` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ReceiptsTypes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `ReceiptsTypes` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" INTEGER NOT NULL,
    "validity" DATETIME,
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
INSERT INTO "new_Receipts" ("FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "receiptsTypesId", "totalWage", "validity") SELECT "FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "receiptsTypesId", "totalWage", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
CREATE TABLE "new_ReceiptsTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "ReceiptsTypes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptsTypes" ("companyId", "id", "name") SELECT "companyId", "id", "name" FROM "ReceiptsTypes";
DROP TABLE "ReceiptsTypes";
ALTER TABLE "new_ReceiptsTypes" RENAME TO "ReceiptsTypes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
