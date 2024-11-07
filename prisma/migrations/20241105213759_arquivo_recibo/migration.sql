/*
  Warnings:

  - Added the required column `file` to the `ReceiptsTypes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptsTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ReceiptsTypes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptsTypes" ("active", "companyId", "id", "name") SELECT "active", "companyId", "id", "name" FROM "ReceiptsTypes";
DROP TABLE "ReceiptsTypes";
ALTER TABLE "new_ReceiptsTypes" RENAME TO "ReceiptsTypes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
