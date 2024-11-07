/*
  Warnings:

  - You are about to drop the column `receiptsTypesId` on the `Receipts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptTypeId" INTEGER,
    "validity" DATETIME,
    "baseWage" INTEGER,
    "contributionSalaryINSS" INTEGER,
    "baseSalaryFGTS" INTEGER,
    "FGTS" INTEGER,
    "IRRF" INTEGER,
    "totalWage" INTEGER,
    "liquidWage" INTEGER,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptTypeId_fkey" FOREIGN KEY ("receiptTypeId") REFERENCES "ReceiptsTypes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "totalWage", "validity") SELECT "FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "totalWage", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
