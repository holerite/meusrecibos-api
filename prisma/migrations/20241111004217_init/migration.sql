-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "config" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires_at" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "refresh_token" TEXT,
    "refresh_token_expires_at" DATETIME
);

-- CreateTable
CREATE TABLE "EmployeeEnrolment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enrolment" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" INTEGER,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "EmployeeEnrolment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EmployeeEnrolment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemporaryEmployee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "enrolmentId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "TemporaryEmployee_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "EmployeeEnrolment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemporaryEmployee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receipts" (
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

-- CreateTable
CREATE TABLE "ReceiptsTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL DEFAULT '',
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ReceiptsTypes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pin" TEXT NOT NULL,
    "loginId" INTEGER
);

-- CreateTable
CREATE TABLE "SystemRoutes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "clientAccess" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "_CompanyToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CompanyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CompanyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_cpf_key" ON "Employee"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_loginId_key" ON "Pin"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToUser_AB_unique" ON "_CompanyToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToUser_B_index" ON "_CompanyToUser"("B");
