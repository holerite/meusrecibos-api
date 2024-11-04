/*
  Warnings:

  - You are about to drop the `TemporaryEmployee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `enrolmentId` to the `Receipts` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TemporaryEmployee";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmployeeEnrolment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enrolment" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" INTEGER,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "EmployeeEnrolment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeEnrolment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmployeeEnrolment" ("active", "companyId", "employeeId", "enrolment", "id") SELECT "active", "companyId", "employeeId", "enrolment", "id" FROM "EmployeeEnrolment";
DROP TABLE "EmployeeEnrolment";
ALTER TABLE "new_EmployeeEnrolment" RENAME TO "EmployeeEnrolment";
CREATE TABLE "new_Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "payday" DATETIME,
    "validity" DATETIME,
    "file" TEXT NOT NULL,
    "enrolmentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    CONSTRAINT "Receipts_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "EmployeeEnrolment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Receipts" ("companyId", "employeeId", "file", "id", "opened", "payday", "receiptsTypesId", "validity") SELECT "companyId", "employeeId", "file", "id", "opened", "payday", "receiptsTypesId", "validity" FROM "Receipts";
DROP TABLE "Receipts";
ALTER TABLE "new_Receipts" RENAME TO "Receipts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
