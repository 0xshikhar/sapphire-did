/*
  Warnings:

  - You are about to drop the column `userId` on the `datasets` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `datasets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "datasets" DROP CONSTRAINT "datasets_userId_fkey";

-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_datasetId_fkey";

-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_userId_fkey";

-- AlterTable
ALTER TABLE "datasets" DROP COLUMN "userId",
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password";

-- DropTable
DROP TABLE "permissions";

-- CreateTable
CREATE TABLE "dataset_shares" (
    "id" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datasetId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,

    CONSTRAINT "dataset_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dataset_shares_datasetId_sharedWithId_key" ON "dataset_shares"("datasetId", "sharedWithId");

-- AddForeignKey
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_shares" ADD CONSTRAINT "dataset_shares_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_shares" ADD CONSTRAINT "dataset_shares_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_shares" ADD CONSTRAINT "dataset_shares_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
