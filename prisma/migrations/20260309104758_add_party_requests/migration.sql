-- CreateEnum
CREATE TYPE "PartyRequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "party_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "childName" TEXT,
    "childAge" INTEGER,
    "date" TIMESTAMP(3),
    "guestsCount" INTEGER,
    "program" TEXT,
    "wishes" TEXT,
    "restaurant" TEXT,
    "status" "PartyRequestStatus" NOT NULL DEFAULT 'NEW',
    "total" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "party_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "party_requests_status_createdAt_idx" ON "party_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "party_requests" ADD CONSTRAINT "party_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
