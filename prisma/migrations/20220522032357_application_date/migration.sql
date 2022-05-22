/*
  Warnings:

  - Added the required column `applicationEnd` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationStart` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicationStart" DATETIME NOT NULL,
    "applicationEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contest" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
