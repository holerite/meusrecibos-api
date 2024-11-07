-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemRoutes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "clientAccess" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_SystemRoutes" ("active", "clientAccess", "id", "name", "route") SELECT "active", "clientAccess", "id", "name", "route" FROM "SystemRoutes";
DROP TABLE "SystemRoutes";
ALTER TABLE "new_SystemRoutes" RENAME TO "SystemRoutes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
