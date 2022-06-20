/*
  Warnings:

  - Added the required column `name` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "applicationStart" DATETIME NOT NULL,
    "applicationEnd" DATETIME NOT NULL,
    "letterUploadStart" DATETIME NOT NULL,
    "letterUploadEnd" DATETIME NOT NULL,
    "designReportStart" DATETIME NOT NULL,
    "designReportEnd" DATETIME NOT NULL,
    "techControlsStart" DATETIME NOT NULL,
    "techControlsEnd" DATETIME NOT NULL,
    "finalRaceStart" DATETIME NOT NULL,
    "finalRaceEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contest" ("applicationEnd", "applicationStart", "createdAt", "designReportEnd", "designReportStart", "finalRaceEnd", "finalRaceStart", "id", "letterUploadEnd", "letterUploadStart", "techControlsEnd", "techControlsStart", "updatedAt") SELECT "applicationEnd", "applicationStart", "createdAt", "designReportEnd", "designReportStart", "finalRaceEnd", "finalRaceStart", "id", "letterUploadEnd", "letterUploadStart", "techControlsEnd", "techControlsStart", "updatedAt" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
CREATE UNIQUE INDEX "Contest_name_key" ON "Contest"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
