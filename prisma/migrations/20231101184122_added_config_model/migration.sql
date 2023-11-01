-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "minCodeVersion" INTEGER NOT NULL,
    "linkCheckout" TEXT NOT NULL,
    "maintenance" BOOLEAN NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);
