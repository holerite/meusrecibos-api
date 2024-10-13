/*
  Warnings:

  - You are about to alter the column `reference` on the `ReceiptDetails` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptDetails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT,
    "description" TEXT,
    "reference" INTEGER,
    "salary" INTEGER,
    "discounts" INTEGER,
    "receiptsId" INTEGER,
    CONSTRAINT "ReceiptDetails_receiptsId_fkey" FOREIGN KEY ("receiptsId") REFERENCES "Receipts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptDetails" ("code", "description", "discounts", "id", "receiptsId", "reference", "salary") SELECT "code", "description", "discounts", "id", "receiptsId", "reference", "salary" FROM "ReceiptDetails";
DROP TABLE "ReceiptDetails";
ALTER TABLE "new_ReceiptDetails" RENAME TO "ReceiptDetails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
