-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptDetails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER,
    "description" TEXT,
    "reference" REAL,
    "salary" INTEGER,
    "discounts" INTEGER
);
INSERT INTO "new_ReceiptDetails" ("code", "description", "discounts", "id", "reference", "salary") SELECT "code", "description", "discounts", "id", "reference", "salary" FROM "ReceiptDetails";
DROP TABLE "ReceiptDetails";
ALTER TABLE "new_ReceiptDetails" RENAME TO "ReceiptDetails";
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
    "FGTS" INTEGER,
    "IRRF" INTEGER,
    "totalWage" INTEGER,
    "liquidWage" INTEGER,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "receiptsTypesId", "totalWage", "validity") SELECT "FGTS", "IRRF", "baseSalaryFGTS", "baseWage", "companyId", "contributionSalaryINSS", "employeeId", "id", "liquidWage", "opened", "receiptsTypesId", "totalWage", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
