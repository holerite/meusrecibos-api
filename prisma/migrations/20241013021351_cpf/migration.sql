-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmployeeEnrolment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enrolment" TEXT NOT NULL,
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
