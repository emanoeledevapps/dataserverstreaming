-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "from" TEXT,
    "for" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "visualized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_for_fkey" FOREIGN KEY ("for") REFERENCES "User"("wallet") ON DELETE RESTRICT ON UPDATE CASCADE;
