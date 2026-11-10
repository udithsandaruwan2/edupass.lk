-- CreateEnum
CREATE TYPE "CheckInResult" AS ENUM ('ADMITTED', 'DUPLICATE', 'WRONG_SEMINAR', 'INVALID', 'VOID', 'CROSS_TENANT');

-- CreateTable
CREATE TABLE "CheckInEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT,
    "seminarId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "scannedCode" TEXT NOT NULL,
    "result" "CheckInResult" NOT NULL,
    "message" TEXT NOT NULL,
    "scannedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckInEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckInEvent_seminarId_createdAt_idx" ON "CheckInEvent"("seminarId", "createdAt");

-- CreateIndex
CREATE INDEX "CheckInEvent_organisationId_idx" ON "CheckInEvent"("organisationId");

-- CreateIndex
CREATE INDEX "CheckInEvent_ticketId_idx" ON "CheckInEvent"("ticketId");

-- AddForeignKey
ALTER TABLE "CheckInEvent" ADD CONSTRAINT "CheckInEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInEvent" ADD CONSTRAINT "CheckInEvent_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInEvent" ADD CONSTRAINT "CheckInEvent_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
