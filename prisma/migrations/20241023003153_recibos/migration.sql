/*
  Warnings:

  - You are about to drop the `ReceiptDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `FGTS` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `IRRF` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `baseSalaryFGTS` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `baseWage` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `contributionSalaryINSS` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `liquidWage` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `totalWage` on the `Receipts` table. All the data in the column will be lost.
  - Added the required column `file` to the `Receipts` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ReceiptDetails";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "payday" DATETIME,
    "validity" DATETIME,
    "file" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" INTEGER NOT NULL,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("companyId", "employeeId", "id", "opened", "payday", "receiptsTypesId", "validity") SELECT "companyId", "employeeId", "id", "opened", "payday", "receiptsTypesId", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
