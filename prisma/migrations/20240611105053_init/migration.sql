-- CreateTable
CREATE TABLE `daily_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `openingbalance` INTEGER NOT NULL DEFAULT 0,
    `closingbalance` INTEGER NOT NULL DEFAULT 0,
    `normalSales` INTEGER NOT NULL DEFAULT 0,
    `virtualSales` INTEGER NOT NULL DEFAULT 0,
    `normalPayout` INTEGER NOT NULL DEFAULT 0,
    `onlineSales` INTEGER NOT NULL DEFAULT 0,
    `onlinePayout` INTEGER NOT NULL DEFAULT 0,
    `vurtualPayout` INTEGER NOT NULL DEFAULT 0,
    `cashIn` INTEGER NOT NULL DEFAULT 0,
    `cashOut` INTEGER NOT NULL DEFAULT 0,
    `expenses` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `daily_transactions` ADD CONSTRAINT `daily_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
