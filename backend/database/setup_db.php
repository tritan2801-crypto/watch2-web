<?php
/**
 * Database Setup & Seeding Script
 */
$host = "127.0.0.1";
$user = "root";
$pass = "";

try {
    // 1. Establish initial connection (without selecting DB)
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "Connected to MySQL successfully.\n";

    // 2. Read schema file
    $schemaFile = __DIR__ . '/schema.sql';
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found at: $schemaFile");
    }
    
    $sql = file_get_contents($schemaFile);
    echo "Reading schema.sql...\n";

    // 3. Execute queries
    // We split by semicolon to handle multiple statements if PDO doesn't execute multi-query by default
    // Or we can execute it directly if PDO allows multi_query
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 1);
    $pdo->exec($sql);
    
    echo "Database 'watch2_web' and tables initialized successfully!\n";
    
    // 4. Verification
    $pdo->exec("USE `watch2_web`");
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in database: " . implode(', ', $tables) . "\n";

    // Seed default admin user (email: admin@mvmt.com, password: password123)
    $stmt = $pdo->query("SELECT COUNT(*) FROM `users` WHERE `email` = 'admin@mvmt.com'");
    if ($stmt->fetchColumn() == 0) {
        $passwordHash = password_hash('password123', PASSWORD_BCRYPT);
        $insertUser = $pdo->prepare("INSERT INTO `users` (`email`, `password_hash`, `name`, `role_id`) VALUES (?, ?, ?, ?)");
        $insertUser->execute(['admin@mvmt.com', $passwordHash, 'Quản trị viên A Tuấn', 1]);
        echo "Default admin user seeded (admin@mvmt.com / password123)\n";
    } else {
        $updateUser = $pdo->prepare("UPDATE `users` SET `name` = ? WHERE `email` = ?");
        $updateUser->execute(['Quản trị viên A Tuấn', 'admin@mvmt.com']);
    }

    // Seed default regular user (email: user@mvmt.com, password: password123)
    $stmt = $pdo->query("SELECT COUNT(*) FROM `users` WHERE `email` = 'user@mvmt.com'");
    if ($stmt->fetchColumn() == 0) {
        $passwordHash = password_hash('password123', PASSWORD_BCRYPT);
        $insertUser = $pdo->prepare("INSERT INTO `users` (`email`, `password_hash`, `name`, `role_id`) VALUES (?, ?, ?, ?)");
        $insertUser->execute(['user@mvmt.com', $passwordHash, 'Khách hàng A Tuấn', 2]);
        echo "Default customer user seeded (user@mvmt.com / password123)\n";
    } else {
        $updateUser = $pdo->prepare("UPDATE `users` SET `name` = ? WHERE `email` = ?");
        $updateUser->execute(['Khách hàng A Tuấn', 'user@mvmt.com']);
    }

    // 5. Run database migration patches
    echo "Running database migration patches...\n";
    include __DIR__ . '/create_coupons_table.php';
    include __DIR__ . '/add_coupon_id_to_orders.php';
    include __DIR__ . '/add_shipping_status_to_orders.php';
    include __DIR__ . '/update_orders_table.php';
    echo "All migrations completed successfully!\n";

} catch (Exception $e) {
    echo "Setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
