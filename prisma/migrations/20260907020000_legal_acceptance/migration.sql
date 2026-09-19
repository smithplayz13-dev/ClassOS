CREATE TABLE "LegalAcceptance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LegalAcceptance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LegalAcceptance_tokenHash_key" ON "LegalAcceptance"("tokenHash");
CREATE INDEX "LegalAcceptance_studentId_idx" ON "LegalAcceptance"("studentId");
