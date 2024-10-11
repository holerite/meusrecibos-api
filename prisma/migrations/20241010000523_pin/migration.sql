/*
  Warnings:

  - Added the required column `pin` to the `Pin` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "pin" TEXT NOT NULL,
    CONSTRAINT "Pin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pin" ("id", "userId") SELECT "id", "userId" FROM "Pin";
DROP TABLE "Pin";
ALTER TABLE "new_Pin" RENAME TO "Pin";
CREATE UNIQUE INDEX "Pin_userId_key" ON "Pin"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
