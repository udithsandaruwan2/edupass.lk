-- CreateEnum
CREATE TYPE "CheckInMode" AS ENUM ('QR_GATE', 'JOIN_LINK', 'BOTH');

-- CreateEnum
CREATE TYPE "SeminarMode" AS ENUM ('PHYSICAL', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "SeminarStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExamLevel" AS ENUM ('AL', 'OL');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LecturerProfile" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "subjects" TEXT[],
    "bio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LecturerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seminar" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" "ExamLevel" NOT NULL,
    "categoryId" TEXT,
    "lecturerProfileId" TEXT,
    "mode" "SeminarMode" NOT NULL DEFAULT 'PHYSICAL',
    "venue" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[],
    "agenda" JSONB NOT NULL,
    "status" "SeminarStatus" NOT NULL DEFAULT 'DRAFT',
    "checkInMode" "CheckInMode",
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'Sinhala',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seminar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "seminarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priceLkr" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "LecturerProfile_organisationId_idx" ON "LecturerProfile"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "Seminar_slug_key" ON "Seminar"("slug");

-- CreateIndex
CREATE INDEX "Seminar_organisationId_idx" ON "Seminar"("organisationId");

-- CreateIndex
CREATE INDEX "Seminar_status_startsAt_idx" ON "Seminar"("status", "startsAt");

-- CreateIndex
CREATE INDEX "Seminar_subject_idx" ON "Seminar"("subject");

-- CreateIndex
CREATE INDEX "Seminar_district_idx" ON "Seminar"("district");

-- CreateIndex
CREATE INDEX "TicketType_seminarId_idx" ON "TicketType"("seminarId");

-- AddForeignKey
ALTER TABLE "LecturerProfile" ADD CONSTRAINT "LecturerProfile_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seminar" ADD CONSTRAINT "Seminar_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seminar" ADD CONSTRAINT "Seminar_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seminar" ADD CONSTRAINT "Seminar_lecturerProfileId_fkey" FOREIGN KEY ("lecturerProfileId") REFERENCES "LecturerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_seminarId_fkey" FOREIGN KEY ("seminarId") REFERENCES "Seminar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
