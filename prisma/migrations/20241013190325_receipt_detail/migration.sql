/*
  Warnings:

  - You are about to drop the column `companyId` on the `ReceiptsTypes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptsTypes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_ReceiptsTypes" ("id", "name") SELECT "id", "name" FROM "ReceiptsTypes";
DROP TABLE "ReceiptsTypes";
ALTER TABLE "new_ReceiptsTypes" RENAME TO "ReceiptsTypes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
