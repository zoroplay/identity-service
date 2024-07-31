-- DropForeignKey
ALTER TABLE `agent_users` DROP FOREIGN KEY `agent_users_agent_id_fkey`;

-- DropForeignKey
ALTER TABLE `agent_users` DROP FOREIGN KEY `agent_users_user_id_fkey`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `pin` INTEGER NULL;

-- CreateTable
CREATE TABLE `retail_commission_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL,
    `description` VARCHAR(191) NULL,
    `provider_group` VARCHAR(191) NOT NULL,
    `period` ENUM('weekly', 'monthly') NOT NULL DEFAULT 'weekly',
    `calculationType` VARCHAR(191) NOT NULL DEFAULT 'flat',
    `percentage` DOUBLE NULL,
    `commissionType` INTEGER NULL,
    `clientId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_commission_turnovers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event` INTEGER NOT NULL,
    `max_odd` DOUBLE NOT NULL,
    `min_odd` DOUBLE NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `odd_set` BOOLEAN NOT NULL,
    `commissionId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_user_commission_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'sports',
    `userId` INTEGER NOT NULL,
    `profileId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `retail_user_commission_profiles_userId_profileId_key`(`userId`, `profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_commissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `userCommssionId` INTEGER NOT NULL,
    `total_tickets` INTEGER NULL,
    `total_stake` DOUBLE NULL,
    `total_won` DOUBLE NULL,
    `net` DOUBLE NULL,
    `commission` DOUBLE NULL,
    `profit` DOUBLE NULL,
    `start_date` VARCHAR(191) NOT NULL,
    `end_date` VARCHAR(191) NOT NULL,
    `is_paid` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_commission_bonus_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `min_selection` DOUBLE NOT NULL,
    `max_selection` DOUBLE NOT NULL,
    `rate_is_less` DOUBLE NOT NULL,
    `rate_is_more` DOUBLE NOT NULL,
    `rate` DOUBLE NOT NULL,
    `target_stake` DOUBLE NOT NULL,
    `target_coupon` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_normal_payout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bet_id` INTEGER NOT NULL,
    `selection_count` INTEGER NOT NULL,
    `total_odds` DOUBLE NOT NULL,
    `stake` DOUBLE NOT NULL,
    `user_id` INTEGER NOT NULL,
    `client_id` INTEGER NOT NULL,
    `profile_id` INTEGER NOT NULL,
    `profileGroup` VARCHAR(191) NULL,
    `commission` DOUBLE NOT NULL,
    `is_paid` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retail_power_payout` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `client_id` INTEGER NOT NULL,
    `total_tickets` INTEGER NOT NULL,
    `total_stake` DOUBLE NOT NULL,
    `total_weighted_stake` DOUBLE NOT NULL,
    `average_no_of_selections` DOUBLE NOT NULL,
    `gross_profit` DOUBLE NOT NULL,
    `ggr_percent` DOUBLE NOT NULL,
    `rate_is_less` DOUBLE NOT NULL,
    `rate_is_more` DOUBLE NOT NULL,
    `rate` DOUBLE NOT NULL,
    `turnover_commission` DOUBLE NOT NULL,
    `monthly_bonus` DOUBLE NOT NULL,
    `total_winnings` DOUBLE NOT NULL,
    `status` BOOLEAN NOT NULL,
    `message` VARCHAR(191) NULL,
    `is_paid` BOOLEAN NOT NULL,
    `start_date` VARCHAR(191) NOT NULL,
    `end_date` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agent_users` ADD CONSTRAINT `agent_users_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `agent_users` ADD CONSTRAINT `agent_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `retail_commission_profiles` ADD CONSTRAINT `retail_commission_profiles_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retail_commission_turnovers` ADD CONSTRAINT `retail_commission_turnovers_commissionId_fkey` FOREIGN KEY (`commissionId`) REFERENCES `retail_commission_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retail_user_commission_profiles` ADD CONSTRAINT `retail_user_commission_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retail_user_commission_profiles` ADD CONSTRAINT `retail_user_commission_profiles_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `retail_commission_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retail_commissions` ADD CONSTRAINT `retail_commissions_userCommssionId_fkey` FOREIGN KEY (`userCommssionId`) REFERENCES `retail_user_commission_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
