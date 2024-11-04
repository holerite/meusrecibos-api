-- CreateTable
CREATE TABLE "TemporaryEmployee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enrolment" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "TemporaryEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
