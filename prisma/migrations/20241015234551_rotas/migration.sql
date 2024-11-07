/*
  Warnings:

  - You are about to drop the column `userId` on the `Pin` table. All the data in the column will be lost.
  - Added the required column `loginId` to the `Pin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "pinId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loginId" INTEGER NOT NULL,
    "pin" TEXT NOT NULL
);
INSERT INTO "new_Pin" ("id", "pin") SELECT "id", "pin" FROM "Pin";
DROP TABLE "Pin";
ALTER TABLE "new_Pin" RENAME TO "Pin";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
