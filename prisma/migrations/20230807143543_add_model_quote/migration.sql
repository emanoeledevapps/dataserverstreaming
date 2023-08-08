-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "reservedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
