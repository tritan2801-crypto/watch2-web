<?php
/**
 * Database Migration Patch: Add coupon_id and discount_amount to orders table
 */
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=watch2_web;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Add coupon_id if not exists
    $q = $pdo->query("SHOW COLUMNS FROM `orders` LIKE 'coupon_id'");
    $column = $q->fetch();
    if (!$column) {
        $pdo->exec("ALTER TABLE `orders` ADD COLUMN `coupon_id` INT NULL");
        $pdo->exec("ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_coupons` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE SET NULL");
        echo "Successfully added `coupon_id` column and foreign key to `orders` table.\n";
    } else {
        echo "`coupon_id` column already exists.\n";
    }

    // Add discount_amount if not exists
    $q = $pdo->query("SHOW COLUMNS FROM `orders` LIKE 'discount_amount'");
    $column = $q->fetch();
    if (!$column) {
        $pdo->exec("ALTER TABLE `orders` ADD COLUMN `discount_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `total_amount`");
        echo "Successfully added `discount_amount` column to `orders` table.\n";
    } else {
        echo "`discount_amount` column already exists.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
