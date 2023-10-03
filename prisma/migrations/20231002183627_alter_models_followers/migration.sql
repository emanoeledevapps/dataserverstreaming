/*
  Warnings:

  - You are about to drop the column `userData` on the `Followers` table. All the data in the column will be lost.
  - You are about to drop the column `userData` on the `Following` table. All the data in the column will be lost.
  - Added the required column `followerId` to the `Followers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followerId` to the `Following` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Followers" DROP COLUMN "userData",
ADD COLUMN     "followerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Following" DROP COLUMN "userData",
ADD COLUMN     "followerId" TEXT NOT NULL;
