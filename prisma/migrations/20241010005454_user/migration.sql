/*
  Warnings:

  - You are about to drop the `EmployeeOnCompany` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersOnCompany` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeeOnCompany";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UsersOnCompany";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_CompanyToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CompanyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CompanyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CompanyToEmployee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CompanyToEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CompanyToEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToUser_AB_unique" ON "_CompanyToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToUser_B_index" ON "_CompanyToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompanyToEmployee_AB_unique" ON "_CompanyToEmployee"("A", "B");

-- CreateIndex
CREATE INDEX "_CompanyToEmployee_B_index" ON "_CompanyToEmployee"("B");
