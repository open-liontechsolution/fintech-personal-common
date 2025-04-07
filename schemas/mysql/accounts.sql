-- Accounts and Financial Data Schema
-- This schema defines the tables related to financial accounts and transactions

-- Accounts table
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('checking', 'savings', 'credit', 'investment') NOT NULL,
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'EUR',
  `description` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table for transaction categorization
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,  -- NULL means system category (shared)
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('income', 'expense', 'transfer') NOT NULL,
  `color` VARCHAR(7) NULL DEFAULT '#CCCCCC', -- Hex color code
  `icon` VARCHAR(50) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_category_name_unique` (`user_id`, `name`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subcategories table
CREATE TABLE IF NOT EXISTS `subcategories` (
  `id` VARCHAR(36) PRIMARY KEY,
  `category_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,  -- NULL means system subcategory (shared)
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_subcategory_name_unique` (`category_id`, `user_id`, `name`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NULL,
  `subcategory_id` VARCHAR(36) NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `date` DATE NOT NULL,
  `description` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `is_recurring` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `import_id` VARCHAR(36) NULL,  -- Reference to the import batch
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget table
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NULL,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `period` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  `start_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `color`, `icon`) VALUES
(UUID(), NULL, 'Housing', 'expense', '#FF9800', 'home'),
(UUID(), NULL, 'Food', 'expense', '#4CAF50', 'restaurant'),
(UUID(), NULL, 'Transportation', 'expense', '#2196F3', 'directions_car'),
(UUID(), NULL, 'Entertainment', 'expense', '#9C27B0', 'movie'),
(UUID(), NULL, 'Healthcare', 'expense', '#F44336', 'local_hospital'),
(UUID(), NULL, 'Income', 'income', '#009688', 'account_balance'),
(UUID(), NULL, 'Transfer', 'transfer', '#607D8B', 'swap_horiz')
ON DUPLICATE KEY UPDATE `updated_at` = NOW();
