-- CreateEnum
CREATE TYPE "PlatformInvoiceStatus" AS ENUM ('AWAITING_SLIP', 'UNDER_REVIEW', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PlatformInvoice" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amountLkr" INTEGER NOT NULL,
    "status" "PlatformInvoiceStatus" NOT NULL DEFAULT 'AWAITING_SLIP',
    "slipReference" TEXT,
    "note" TEXT,
    "rejectionReason" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstituteEnrollment" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "batchId" TEXT,
    "studentUserId" TEXT,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstituteEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformInvoice_organisationId_status_idx" ON "PlatformInvoice"("organisationId", "status");

-- CreateIndex
CREATE INDEX "Batch_organisationId_idx" ON "Batch"("organisationId");

-- CreateIndex
CREATE INDEX "InstituteEnrollment_organisationId_idx" ON "InstituteEnrollment"("organisationId");

-- CreateIndex
CREATE INDEX "InstituteEnrollment_batchId_idx" ON "InstituteEnrollment"("batchId");

-- AddForeignKey
ALTER TABLE "PlatformInvoice" ADD CONSTRAINT "PlatformInvoice_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformInvoice" ADD CONSTRAINT "PlatformInvoice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstituteEnrollment" ADD CONSTRAINT "InstituteEnrollment_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstituteEnrollment" ADD CONSTRAINT "InstituteEnrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
