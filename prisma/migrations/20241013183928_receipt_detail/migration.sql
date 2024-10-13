/*
  Warnings:

  - You are about to drop the column `receiptTypeId` on the `Receipts` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_ReceiptsToReceiptsTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ReceiptsToReceiptsTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "Receipts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ReceiptsToReceiptsTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "ReceiptsTypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "payday" DATETIME,
    "validity" DATETIME,
    "baseWage" INTEGER,
    "contributionSalaryINSS" INTEGER,
    "baseSalaryFGTS" INTEGER,
    "FGTS" INTEGER,
    "IRRF" INTEGER,
    "totalWage" INTEGER,
    "liquidWage" INTEGER,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "payday", "totalWage", "validity") SELECT "FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "payday", "totalWage", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ReceiptsToReceiptsTypes_AB_unique" ON "_ReceiptsToReceiptsTypes"("A", "B");

-- CreateIndex
CREATE INDEX "_ReceiptsToReceiptsTypes_B_index" ON "_ReceiptsToReceiptsTypes"("B");
