-- Drop database if exists to refresh
DROP DATABASE IF EXISTS `watch2_web`;
CREATE DATABASE `watch2_web` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `watch2_web`;

-- Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) UNIQUE NOT NULL,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions Table
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role-Permissions Relation Table
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_id` INT,
    `permission_id` INT,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `role_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `size` VARCHAR(20) NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `is_new` TINYINT(1) DEFAULT 0,
    `is_bestseller` TINYINT(1) DEFAULT 0,
    `stock` INT DEFAULT 10,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `status` VARCHAR(50) DEFAULT 'pending',
    `total_amount` DECIMAL(10,2) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT,
    `product_id` INT,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES 
(1, 'Admin', 'Administrator with full access'),
(2, 'Customer', 'Regular shop customer')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed default permissions
INSERT INTO `permissions` (`id`, `name`, `description`) VALUES 
(1, 'view_products', 'View product list and details'),
(2, 'manage_products', 'Create, update and delete products'),
(3, 'place_orders', 'Place orders in the system'),
(4, 'view_all_orders', 'View all orders (admin role)')
ON DUPLICATE KEY UPDATE `name`=`name`;

-- Seed role-permissions
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), -- Admin permissions
(2, 1), (2, 3)                   -- Customer permissions
ON DUPLICATE KEY UPDATE `role_id`=`role_id`;

-- Seed sample products
INSERT INTO `products` (`id`, `title`, `category`, `price`, `size`, `image_url`, `description`, `is_new`, `is_bestseller`, `stock`) VALUES
(1, 'Classic II Vintage - White Gold', 'Mens Watches', 3450000.00, '40mm', 'images/mens_classic.png', 'Một thiết kế tinh tế kết hợp giữa kiểu dáng cổ điển và hơi thở thời đại mới. Đồng hồ sử dụng bộ máy quartz Nhật Bản chính xác, mặt kính mineral chống trầy xước nhẹ và vỏ kim loại thép không gỉ mạ vàng cao cấp.', 0, 1, 15),
(2, 'Coronado Ceramic - Pearl', 'Womens Watches', 7200000.00, '36mm', 'images/womens_ceramic.png', 'Đồng hồ nữ đẳng cấp với vỏ gốm ceramic trắng ánh ngọc trai cao cấp chống xước, kết hợp dây kim loại bạc sáng bóng. Mang lại vẻ đẹp trang nhã và thu hút mọi góc nhìn.', 1, 1, 8),
(3, 'Nova Stella - Rose Blush', 'Womens Watches', 4050000.00, '38mm', 'images/womens_rose.png', 'Thiết kế tối giản đầy nữ tính với tông màu vàng hồng tinh tế. Dây đeo dạng lưới mềm mại mang lại cảm giác thoải mái tối ưu cho cổ tay nhỏ nhắn.', 0, 1, 20),
(4, 'Chrono Ceramic - Phantom', 'Mens Watches', 9200000.00, '45mm', 'images/chrono_phantom.png', 'Dòng Chronograph mạnh mẽ dành cho phái nam. Mặt số đen sâu thẳm kết hợp 3 mặt hiển thị phụ cùng kim giây màu đỏ tạo nét thể thao nổi bật đầy nam tính.', 1, 1, 5),
(5, 'Legacy Slim - Brown Gold', 'Mens Watches', 3950000.00, '42mm', 'images/hero_watch.png', 'Mẫu đồng hồ siêu mỏng lịch lịch phối hợp hoàn mỹ giữa mặt xanh Navy huyền bí, kim vàng hồng tinh xảo và dây da bò cao cấp màu nâu ấm.', 1, 1, 12),
(6, 'Ocean Drive - Matte', 'Mens Watches', 5450000.00, '42mm', 'images/dive_ocean.png', 'Đồng hồ thợ lặn thể thao năng động. Vỏ thép không gỉ nguyên khối bền bỉ cùng vòng bezel xoay đặc trưng màu xanh đen, kim số phủ dạ quang tiện lợi.', 1, 0, 10),
(7, 'Stella 38 - Ice Blue', 'Womens Watches', 4550000.00, '38mm', 'images/dive_ocean.png', 'Bản hòa tấu màu sắc tuyệt đẹp với mặt đồng hồ màu xanh ngọc băng tuyết mát lạnh kết hợp dây kim loại bạc truyền thống sang trọng.', 1, 0, 14)
ON DUPLICATE KEY UPDATE `title`=`title`;
