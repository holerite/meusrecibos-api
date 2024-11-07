/*
  Warnings:

  - You are about to drop the column `admission` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `cbo` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Employee` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TemporaryEmployee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enrolment" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "TemporaryEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires_at" DATETIME
);
INSERT INTO "new_Employee" ("cpf", "email", "id", "name", "refresh_token", "refresh_token_expires_at") SELECT "cpf", "email", "id", "name", "refresh_token", "refresh_token_expires_at" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX "Employee_cpf_key" ON "Employee"("cpf");
CREATE TABLE "new_EmployeeEnrolment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enrolment" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "EmployeeEnrolment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeEnrolment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmployeeEnrolment" ("companyId", "employeeId", "enrolment", "id") SELECT "companyId", "employeeId", "enrolment", "id" FROM "EmployeeEnrolment";
DROP TABLE "EmployeeEnrolment";
ALTER TABLE "new_EmployeeEnrolment" RENAME TO "EmployeeEnrolment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
