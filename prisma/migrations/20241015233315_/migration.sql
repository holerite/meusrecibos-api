/*
  Warnings:

  - Added the required column `clientAccess` to the `SystemRoutes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemRoutes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "clientAccess" BOOLEAN NOT NULL
);
INSERT INTO "new_SystemRoutes" ("active", "id", "name", "route") SELECT "active", "id", "name", "route" FROM "SystemRoutes";
DROP TABLE "SystemRoutes";
ALTER TABLE "new_SystemRoutes" RENAME TO "SystemRoutes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
