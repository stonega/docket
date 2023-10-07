/*
  Warnings:

  - You are about to drop the column `createAt` on the `Excerpt` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `Excerpt` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Excerpt` table. All the data in the column will be lost.
  - Added the required column `site_id` to the `Excerpt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Excerpt` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Excerpt_siteId_idx";

-- AlterTable
ALTER TABLE "Excerpt" DROP COLUMN "createAt",
DROP COLUMN "siteId",
DROP COLUMN "userId",
ADD COLUMN     "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "site_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Excerpt_site_id_idx" ON "Excerpt"("site_id");
