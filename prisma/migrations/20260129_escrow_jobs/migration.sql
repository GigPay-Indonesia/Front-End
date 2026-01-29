-- Escrow Jobs (public Explore listings) + milestone grouping + participants

-- CreateTable
CREATE TABLE IF NOT EXISTS "EscrowJob" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdBy" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "notes" TEXT,
  "tags" TEXT[] NOT NULL,
  "fundingAsset" TEXT NOT NULL,
  "payoutAsset" TEXT NOT NULL,
  "totalAmount" DECIMAL(18,2) NOT NULL,
  "releaseCondition" TEXT NOT NULL,
  "enableYield" BOOLEAN NOT NULL,
  "enableProtection" BOOLEAN NOT NULL,
  CONSTRAINT "EscrowJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EscrowJobMilestone" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "dueDays" INTEGER,
  "percentage" INTEGER NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "escrowIntentId" TEXT,
  CONSTRAINT "EscrowJobMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EscrowJobParticipant" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscrowJobParticipant_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "EscrowJobMilestone"
    ADD CONSTRAINT "EscrowJobMilestone_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "EscrowJob"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EscrowJobMilestone"
    ADD CONSTRAINT "EscrowJobMilestone_escrowIntentId_fkey"
    FOREIGN KEY ("escrowIntentId") REFERENCES "EscrowIntent"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "EscrowJobParticipant"
    ADD CONSTRAINT "EscrowJobParticipant_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "EscrowJob"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes / constraints
CREATE INDEX IF NOT EXISTS "EscrowJob_createdBy_createdAt_idx" ON "EscrowJob"("createdBy", "createdAt");
CREATE INDEX IF NOT EXISTS "EscrowJob_isPublic_createdAt_idx" ON "EscrowJob"("isPublic", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "EscrowJobMilestone_jobId_index_key" ON "EscrowJobMilestone"("jobId", "index");
CREATE UNIQUE INDEX IF NOT EXISTS "EscrowJobMilestone_escrowIntentId_key" ON "EscrowJobMilestone"("escrowIntentId");
CREATE INDEX IF NOT EXISTS "EscrowJobMilestone_escrowIntentId_idx" ON "EscrowJobMilestone"("escrowIntentId");

CREATE UNIQUE INDEX IF NOT EXISTS "EscrowJobParticipant_jobId_address_key" ON "EscrowJobParticipant"("jobId", "address");
CREATE INDEX IF NOT EXISTS "EscrowJobParticipant_address_idx" ON "EscrowJobParticipant"("address");
