/*
  Warnings:

  - Added the required column `userId` to the `CommentPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `LikePublication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CommentPublication" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LikePublication" ADD COLUMN     "userId" TEXT NOT NULL;
