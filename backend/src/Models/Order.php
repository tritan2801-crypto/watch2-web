<?php
namespace Models;

use PDO;

class Order {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create($userId, $totalAmount, $shippingAddress, $couponId = null, $discountAmount = 0.00) {
        $query = "INSERT INTO `orders` (`user_id`, `total_amount`, `discount_amount`, `coupon_id`, `shipping_address`, `status`) 
                  VALUES (:user_id, :total_amount, :discount_amount, :coupon_id, :shipping_address, 'pending')";
        $stmt = $this->db->prepare($query);
        if ($userId === null) {
            $stmt->bindValue(':user_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        }
        if ($couponId === null) {
            $stmt->bindValue(':coupon_id', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindValue(':coupon_id', $couponId, PDO::PARAM_INT);
        }
        $stmt->bindValue(':total_amount', $totalAmount, PDO::PARAM_STR);
        $stmt->bindValue(':discount_amount', $discountAmount, PDO::PARAM_STR);
        $stmt->bindValue(':shipping_address', $shippingAddress, PDO::PARAM_STR);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function addItem($orderId, $productId, $quantity, $price) {
        $query = "INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `price`) 
                  VALUES (:order_id, :product_id, :quantity, :price)";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->bindValue(':product_id', $productId, PDO::PARAM_INT);
        $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
        $stmt->bindValue(':price', $price, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function getByUserId($userId) {
        $query = "SELECT * FROM `orders` WHERE `user_id` = :user_id ORDER BY `id` DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getAll() {
        $query = "SELECT o.*, u.email as user_email 
                  FROM `orders` o 
                  LEFT JOIN `users` u ON o.user_id = u.id 
                  ORDER BY o.id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getItems($orderId) {
        $query = "SELECT oi.*, p.title as product_title, p.image_url 
                  FROM `order_items` oi 
                  LEFT JOIN `products` p ON oi.product_id = p.id 
                  WHERE oi.order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':order_id', $orderId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function updateStatus($id, $status, $paymentStatus, $shippingStatus) {
        $query = "UPDATE `orders` SET `status` = :status, `payment_status` = :payment_status, `shipping_status` = :shipping_status WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':status', $status, PDO::PARAM_STR);
        $stmt->bindValue(':payment_status', $paymentStatus, PDO::PARAM_STR);
        $stmt->bindValue(':shipping_status', $shippingStatus, PDO::PARAM_STR);
        return $stmt->execute();
    }
}

