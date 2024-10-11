-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "enrolment" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UsersOnCompany" (
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("companyId", "userId"),
    CONSTRAINT "UsersOnCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersOnCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeOnCompany" (
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    PRIMARY KEY ("companyId", "employeeId"),
    CONSTRAINT "EmployeeOnCompany_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeOnCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receipts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "payday" DATETIME NOT NULL,
    "validity" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "receiptsTypesId" TEXT NOT NULL,
    CONSTRAINT "Receipts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Receipts_receiptsTypesId_fkey" FOREIGN KEY ("receiptsTypesId") REFERENCES "ReceiptsTypes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceiptsTypes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "ReceiptsTypes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Pin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemRoutes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Pin_userId_key" ON "Pin"("userId");
