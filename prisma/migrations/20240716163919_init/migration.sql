/*
  Warnings:

  - You are about to drop the column `vurtualPayout` on the `daily_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_transactions` DROP COLUMN `vurtualPayout`,
    ADD COLUMN `virtualPayout` INTEGER NULL DEFAULT 0;
