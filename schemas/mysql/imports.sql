-- Imports and Data Processing Schema
-- This schema defines the tables related to data imports and processing

-- File imports table
CREATE TABLE IF NOT EXISTS `file_imports` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `original_file_id` VARCHAR(255) NOT NULL, -- Reference to GridFS file ID
  `file_type` ENUM('bank', 'credit_card', 'investment') NOT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  `progress` TINYINT NOT NULL DEFAULT 0,
  `message` TEXT NULL,
  `records_processed` INT NULL DEFAULT 0,
  `records_imported` INT NULL DEFAULT 0,
  `records_rejected` INT NULL DEFAULT 0,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transformation jobs table
CREATE TABLE IF NOT EXISTS `transformation_jobs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `data_source` ENUM('imported_data', 'all') NOT NULL DEFAULT 'imported_data',
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'canceled') NOT NULL DEFAULT 'pending',
  `progress` TINYINT NOT NULL DEFAULT 0,
  `message` TEXT NULL,
  `from_date` DATE NULL,
  `to_date` DATE NULL,
  `options` JSON NULL,
  `records_processed` INT NULL DEFAULT 0,
  `records_transformed` INT NULL DEFAULT 0,
  `records_rejected` INT NULL DEFAULT 0,
  `started_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Import errors log
CREATE TABLE IF NOT EXISTS `import_errors` (
  `id` VARCHAR(36) PRIMARY KEY,
  `import_id` VARCHAR(36) NOT NULL,
  `row_number` INT NULL,
  `error_message` TEXT NOT NULL,
  `raw_data` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`import_id`) REFERENCES `file_imports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data mapping templates
CREATE TABLE IF NOT EXISTS `data_mapping_templates` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `file_type` ENUM('bank', 'credit_card', 'investment') NOT NULL,
  `mapping_config` JSON NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `user_template_name_unique` (`user_id`, `name`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
