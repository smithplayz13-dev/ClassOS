-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MissedWorkSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "absenceId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    "contentHash" TEXT,
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "providerName" TEXT NOT NULL DEFAULT 'Deterministic text parser',
    "reviewedAt" DATETIME,
    CONSTRAINT "MissedWorkSource_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES "Absence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MissedWorkSource" ("absenceId", "id", "originalText", "processingStatus", "sourceType", "title") SELECT "absenceId", "id", "originalText", "processingStatus", "sourceType", "title" FROM "MissedWorkSource";
DROP TABLE "MissedWorkSource";
ALTER TABLE "new_MissedWorkSource" RENAME TO "MissedWorkSource";
CREATE UNIQUE INDEX "MissedWorkSource_absenceId_contentHash_key" ON "MissedWorkSource"("absenceId", "contentHash");
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "preferredStudyStartTime" TEXT NOT NULL DEFAULT '16:00',
    "dailyStudyLimit" INTEGER NOT NULL DEFAULT 120,
    "scheduleRevision" INTEGER NOT NULL DEFAULT 0,
    "plannedRevision" INTEGER NOT NULL DEFAULT -1,
    "studyBlockMinutes" INTEGER NOT NULL DEFAULT 30,
    "breakMinutes" INTEGER NOT NULL DEFAULT 10
);
INSERT INTO "new_Student" ("dailyStudyLimit", "id", "name", "preferredStudyStartTime", "timezone") SELECT "dailyStudyLimit", "id", "name", "preferredStudyStartTime", "timezone" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
