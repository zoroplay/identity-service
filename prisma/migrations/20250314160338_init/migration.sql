/*
  Warnings:

  - You are about to drop the column `userCommssionId` on the `retail_commissions` table. All the data in the column will be lost.
  - You are about to drop the `daily_transactions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `retail_commissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `daily_transactions` DROP FOREIGN KEY `daily_transactions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_transactions` DROP FOREIGN KEY `daily_transactions_verifiedById_fkey`;

-- DropForeignKey
ALTER TABLE `retail_commissions` DROP FOREIGN KEY `retail_commissions_userCommssionId_fkey`;

-- DropIndex
DROP INDEX `retail_commissions_userCommssionId_fkey` ON `retail_commissions`;

-- AlterTable
ALTER TABLE `retail_commissions` DROP COLUMN `userCommssionId`,
    ADD COLUMN `profileId` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user_details` ADD COLUMN `lga` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `trackier_id` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `daily_transactions`;

-- CreateTable
CREATE TABLE `oauth_access_token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `client_id` INTEGER NOT NULL,
    `scopes` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `retail_commissions` ADD CONSTRAINT `retail_commissions_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `retail_commission_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
