-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'assignment',
    "dueDate" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "sourceId" TEXT,
    "testId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "AcademicTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AcademicTask_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AcademicTask_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AcademicTask_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MissedWorkSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AcademicTask" ("completedAt", "createdAt", "description", "difficulty", "dueDate", "estimatedMinutes", "id", "importance", "priority", "sourceId", "status", "studentId", "subjectId", "title", "type") SELECT "completedAt", "createdAt", "description", "difficulty", "dueDate", "estimatedMinutes", "id", "importance", "priority", "sourceId", "status", "studentId", "subjectId", "title", "type" FROM "AcademicTask";
DROP TABLE "AcademicTask";
ALTER TABLE "new_AcademicTask" RENAME TO "AcademicTask";
CREATE UNIQUE INDEX "AcademicTask_testId_key" ON "AcademicTask"("testId");
CREATE INDEX "AcademicTask_studentId_status_dueDate_idx" ON "AcademicTask"("studentId", "status", "dueDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
