-- CreateEnum (idempotent)
DO $$ BEGIN
  CREATE TYPE "EscrowIntentStatus" AS ENUM ('CREATED', 'FUNDED', 'SUBMITTED', 'RELEASED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable (idempotent per-column)
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "status" "EscrowIntentStatus" NOT NULL DEFAULT 'CREATED';
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "onchainIntentId" BIGINT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "evidenceHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "createdTxHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "fundedTxHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "submittedTxHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "releasedTxHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "refundedTxHash" TEXT;
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "fundedAt" TIMESTAMP(3);
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP(3);
ALTER TABLE "EscrowIntent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "EscrowIntent_onchainIntentId_key" ON "EscrowIntent"("onchainIntentId");

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "EscrowEventCursor" (
  "id" TEXT NOT NULL,
  "lastProcessedBlock" BIGINT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscrowEventCursor_pkey" PRIMARY KEY ("id")
);
