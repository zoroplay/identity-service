/*
  Warnings:

  - You are about to drop the column `website` on the `clients` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_details_email_key` ON `user_details`;

-- DropIndex
DROP INDEX `users_username_key` ON `users`;

-- AlterTable
ALTER TABLE `clients` DROP COLUMN `website`,
    ADD COLUMN `apiUrl` VARCHAR(191) NULL,
    ADD COLUMN `mobileUrl` VARCHAR(191) NULL,
    ADD COLUMN `oAuthToken` VARCHAR(191) NULL,
    ADD COLUMN `shopUrl` VARCHAR(191) NULL,
    ADD COLUMN `webUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `auth_code` VARCHAR(191) NULL,
    ADD COLUMN `last_login` VARCHAR(191) NULL,
    ADD COLUMN `registration_source` VARCHAR(191) NULL,
    ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `trakier_token` VARCHAR(191) NULL,
    ADD COLUMN `verified` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `virutal_token` VARCHAR(191) NULL;
