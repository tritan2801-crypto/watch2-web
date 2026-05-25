<?php
/**
 * Database Migration Patch: Add payment_status to orders table
 */
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=watch2_web;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Check if column exists
    $q = $pdo->query("SHOW COLUMNS FROM `orders` LIKE 'payment_status'");
    $column = $q->fetch();

    if (!$column) {
        $pdo->exec("ALTER TABLE `orders` ADD COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'pending_payment'");
        echo "Successfully added `payment_status` column to `orders` table.\n";
    } else {
        echo "`payment_status` column already exists in `orders` table.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
