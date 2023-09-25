-- CreateTable
CREATE TABLE "TransactionQueue" (
    "id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "finished" BOOLEAN NOT NULL,

    CONSTRAINT "TransactionQueue_pkey" PRIMARY KEY ("id")
);
