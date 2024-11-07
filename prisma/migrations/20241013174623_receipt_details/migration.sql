-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptDetails" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER,
    "description" TEXT,
    "reference" REAL,
    "salary" INTEGER,
    "discounts" INTEGER,
    "receiptsId" INTEGER,
    CONSTRAINT "ReceiptDetails_receiptsId_fkey" FOREIGN KEY ("receiptsId") REFERENCES "Receipts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptDetails" ("code", "description", "discounts", "id", "reference", "salary") SELECT "code", "description", "discounts", "id", "reference", "salary" FROM "ReceiptDetails";
DROP TABLE "ReceiptDetails";
ALTER TABLE "new_ReceiptDetails" RENAME TO "ReceiptDetails";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
