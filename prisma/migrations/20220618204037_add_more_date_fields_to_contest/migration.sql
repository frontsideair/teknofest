/*
  Warnings:

  - Added the required column `designReportEnd` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designReportStart` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalRaceEnd` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalRaceStart` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `letterUploadEnd` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `letterUploadStart` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `techControlsEnd` to the `Contest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `techControlsStart` to the `Contest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_Contest" ("applicationEnd", "applicationStart", "createdAt", "id", "updatedAt") SELECT "applicationEnd", "applicationStart", "createdAt", "id", "updatedAt" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
