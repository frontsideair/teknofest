/*
  Warnings:

  - The required column `inviteCode` was added to the `Contest` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateTable
CREATE TABLE "ContestJudge" (
    "contestId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("contestId", "userId"),
    CONSTRAINT "ContestJudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContestJudge_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
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
INSERT INTO "new_Contest" ("applicationEnd", "applicationStart", "createdAt", "designReportEnd", "designReportStart", "finalRaceEnd", "finalRaceStart", "id", "letterUploadEnd", "letterUploadStart", "name", "techControlsEnd", "techControlsStart", "updatedAt") SELECT "applicationEnd", "applicationStart", "createdAt", "designReportEnd", "designReportStart", "finalRaceEnd", "finalRaceStart", "id", "letterUploadEnd", "letterUploadStart", "name", "techControlsEnd", "techControlsStart", "updatedAt" FROM "Contest";
DROP TABLE "Contest";
ALTER TABLE "new_Contest" RENAME TO "Contest";
CREATE UNIQUE INDEX "Contest_name_key" ON "Contest"("name");
CREATE UNIQUE INDEX "Contest_inviteCode_key" ON "Contest"("inviteCode");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
