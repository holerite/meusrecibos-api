/*
  Warnings:

  - You are about to drop the column `enrolment` on the `Receipts` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Receipts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "payday" DATETIME,
    "validity" DATETIME,
    "file" TEXT NOT NULL,
    "enrolmentId" INTEGER,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" INTEGER NOT NULL,
    CONSTRAINT "Receipts_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "EmployeeEnrolment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("companyId", "file", "id", "opened", "payday", "receiptsTypesId", "validity") SELECT "companyId", "file", "id", "opened", "payday", "receiptsTypesId", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
