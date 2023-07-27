-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "responsible" TEXT;

-- CreateTable
CREATE TABLE "CommentsFeedback" (
    "id" TEXT NOT NULL,
    "walletAuthor" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feedbackId" TEXT NOT NULL,

    CONSTRAINT "CommentsFeedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentsFeedback" ADD CONSTRAINT "CommentsFeedback_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
