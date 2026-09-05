-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "preferredStudyStartTime" TEXT NOT NULL DEFAULT '16:00',
    "dailyStudyLimit" INTEGER NOT NULL DEFAULT 120
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    CONSTRAINT "Subject_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TimetableEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicTask" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "AcademicTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AcademicTask_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AcademicTask_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "MissedWorkSource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "estimatedStudyMinutes" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Test_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Test_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'recorded',
    CONSTRAINT "Absence_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MissedWorkSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "absenceId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'text',
    "title" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "MissedWorkSource_absenceId_fkey" FOREIGN KEY ("absenceId") REFERENCES "Absence" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StudySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudySession_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AcademicTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Subject_studentId_idx" ON "Subject"("studentId");

-- CreateIndex
CREATE INDEX "TimetableEntry_subjectId_dayOfWeek_idx" ON "TimetableEntry"("subjectId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "AcademicTask_studentId_status_dueDate_idx" ON "AcademicTask"("studentId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "Test_studentId_date_idx" ON "Test"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Absence_studentId_date_key" ON "Absence"("studentId", "date");

-- CreateIndex
CREATE INDEX "StudySession_studentId_date_idx" ON "StudySession"("studentId", "date");
