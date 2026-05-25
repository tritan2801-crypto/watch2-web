<?php
/**
 * Migration & Seed Script for Coupons
 */
$host = "127.0.0.1";
$user = "root";
$pass = "";
$db = "watch2_web";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    // Create coupons table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `coupons` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `code` VARCHAR(50) UNIQUE NOT NULL,
        `name` VARCHAR(150) NOT NULL,
        `type` ENUM('fixed', 'percentage') NOT NULL,
        `value` DECIMAL(10,2) NOT NULL,
        `max_discount_amount` DECIMAL(10,2) NULL,
        `min_order_value` DECIMAL(10,2) DEFAULT 0.00,
        `applicable_type` ENUM('all_orders', 'specific_products') DEFAULT 'all_orders',
        `total_limit` INT NULL,
        `used_count` INT DEFAULT 0,
        `per_user_limit` INT DEFAULT 1,
        `is_stackable` TINYINT(1) DEFAULT 0,
        `is_active` TINYINT(1) DEFAULT 1,
        `start_date` DATETIME NOT NULL,
        `end_date` DATETIME NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create coupon_product table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `coupon_product` (
        `coupon_id` INT,
        `product_id` INT,
        PRIMARY KEY (`coupon_id`, `product_id`),
        FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    echo "Tables 'coupons' and 'coupon_product' created successfully!\n";

    // Seed default coupons
    $stmt = $pdo->prepare("INSERT INTO `coupons` (`code`, `name`, `type`, `value`, `max_discount_amount`, `min_order_value`, `applicable_type`, `total_limit`, `per_user_limit`, `is_stackable`, `is_active`, `start_date`, `end_date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`=VALUES(`name`)");
    
    $stmt->execute(['WELCOME10', 'Chào Mừng Khách Hàng Mới', 'percentage', 10.00, null, 0.00, 'all_orders', 1000, 1, 0, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59']);
    $stmt->execute(['MVMT10', 'Mã Giảm Giá MVMT', 'percentage', 10.00, null, 0.00, 'all_orders', 1000, 1, 0, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59']);

    echo "Default coupons seeded successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
