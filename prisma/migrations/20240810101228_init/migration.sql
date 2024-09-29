/*
  Warnings:

  - You are about to drop the `daily_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `daily_transactions` DROP FOREIGN KEY `daily_transactions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `daily_transactions` DROP FOREIGN KEY `daily_transactions_verifiedById_fkey`;

-- DropTable
DROP TABLE `daily_transactions`;
