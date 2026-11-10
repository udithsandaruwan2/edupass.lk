-- CreateEnum
CREATE TYPE "CommerceOrderStatus" AS ENUM ('AWAITING_SLIP', 'UNDER_REVIEW', 'PAID', 'REJECTED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommercePaymentMethod" AS ENUM ('BANK_TRANSFER', 'CARD');

-- CreateEnum
CREATE TYPE "SlipStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketLifecycle" AS ENUM ('PENDING', 'VALID', 'CHECKED_IN', 'VOID');

-- CreateEnum
CREATE TYPE "FeeLineStatus" AS ENUM ('ACTIVE', 'VOID');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('OPEN', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "status" "CommerceOrderStatus" NOT NULL DEFAULT 'AWAITING_SLIP',
    "paymentMethod" "CommercePaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "subtotalLkr" INTEGER NOT NULL,
    "bookingFeeLkr" INTEGER NOT NULL DEFAULT 0,
    "totalLkr" INTEGER NOT NULL,
    "commissionPercentSnapshot" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "seminarId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceLkr" INTEGER NOT NULL,
    "attendeeNames" TEXT[],

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSlip" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "status" "SlipStatus" NOT NULL DEFAULT 'PENDING',
    "slipReference" TEXT NOT NULL,
    "note" TEXT,
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "seminarId" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "status" "TicketLifecycle" NOT NULL DEFAULT 'PENDING',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformFeeLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "commissionPercent" DECIMAL(5,2) NOT NULL,
    "ticketSubtotalLkr" INTEGER NOT NULL,
    "feeAmountLkr" INTEGER NOT NULL,
    "status" "FeeLineStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFeeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "amountLkr" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_studentUserId_idx" ON "Order"("studentUserId");

-- CreateIndex
CREATE INDEX "Order_organisationId_status_idx" ON "Order"("organisationId", "status");

-- CreateIndex
CREATE INDEX "OrderLine_orderId_idx" ON "OrderLine"("orderId");

-- CreateIndex
CREATE INDEX "OrderLine_seminarId_idx" ON "OrderLine"("seminarId");

-- CreateIndex
CREATE INDEX "PaymentSlip_organisationId_status_idx" ON "PaymentSlip"("organisationId", "status");

-- CreateIndex
CREATE INDEX "PaymentSlip_orderId_idx" ON "PaymentSlip"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "Ticket_studentUserId_idx" ON "Ticket"("studentUserId");

-- CreateIndex
CREATE INDEX "Ticket_seminarId_idx" ON "Ticket"("seminarId");

-- CreateIndex
CREATE INDEX "Ticket_organisationId_idx" ON "Ticket"("organisationId");

-- CreateIndex
CREATE INDEX "PlatformFeeLine_organisationId_idx" ON "PlatformFeeLine"("organisationId");

-- CreateIndex
CREATE INDEX "PlatformFeeLine_orderId_idx" ON "PlatformFeeLine"("orderId");

-- CreateIndex
CREATE INDEX "RefundRequest_orderId_idx" ON "RefundRequest"("orderId");

-- CreateIndex
CREATE INDEX "RefundRequest_studentUserId_idx" ON "RefundRequest"("studentUserId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLine" ADD CONSTRAINT "OrderLine_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSlip" ADD CONSTRAINT "PaymentSlip_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSlip" ADD CONSTRAINT "PaymentSlip_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "OrderLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeeLine" ADD CONSTRAINT "PlatformFeeLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeeLine" ADD CONSTRAINT "PlatformFeeLine_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
