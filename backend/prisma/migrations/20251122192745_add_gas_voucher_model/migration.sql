-- CreateTable
CREATE TABLE "GasVoucher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kilos" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalDate" TIMESTAMP(3),
    "deliveredDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GasVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GasVoucher_userId_idx" ON "GasVoucher"("userId");

-- CreateIndex
CREATE INDEX "GasVoucher_status_idx" ON "GasVoucher"("status");

-- AddForeignKey
ALTER TABLE "GasVoucher" ADD CONSTRAINT "GasVoucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
