/*
  Warnings:

  - The primary key for the `Feedback` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `feedbackId` on the `CommentsFeedback` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Feedback` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "CommentsFeedback" DROP CONSTRAINT "CommentsFeedback_feedbackId_fkey";

-- AlterTable
ALTER TABLE "CommentsFeedback" DROP COLUMN "feedbackId",
ADD COLUMN     "feedbackId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "CommentsFeedback" ADD CONSTRAINT "CommentsFeedback_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
