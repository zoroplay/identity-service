/*
  Warnings:

  - You are about to drop the column `user_id` on the `daily_transactions` table. All the data in the column will be lost.
  - Added the required column `userId` to the `daily_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `daily_transactions` DROP FOREIGN KEY `daily_transactions_user_id_fkey`;

-- AlterTable
ALTER TABLE `daily_transactions` DROP COLUMN `user_id`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `daily_transactions` ADD CONSTRAINT `daily_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
