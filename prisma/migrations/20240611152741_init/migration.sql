/*
  Warnings:

  - Added the required column `verifiedById` to the `daily_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_transactions` ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verifiedById` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `daily_transactions` ADD CONSTRAINT `daily_transactions_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
