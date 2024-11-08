/*
  Warnings:

  - You are about to drop the column `enrolment` on the `TemporaryEmployee` table. All the data in the column will be lost.
  - Added the required column `enrolmentId` to the `TemporaryEmployee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TemporaryEmployee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enrolmentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "TemporaryEmployee_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "EmployeeEnrolment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemporaryEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TemporaryEmployee" ("companyId", "id", "name") SELECT "companyId", "id", "name" FROM "TemporaryEmployee";
DROP TABLE "TemporaryEmployee";
ALTER TABLE "new_TemporaryEmployee" RENAME TO "TemporaryEmployee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
