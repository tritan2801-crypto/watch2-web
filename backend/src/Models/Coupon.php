<?php
namespace Models;

use PDO;

class Coupon {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getByCode($code) {
        $query = "SELECT * FROM `coupons` WHERE UPPER(`code`) = UPPER(:code)";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':code', $code, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    public function getById($id) {
        $query = "SELECT * FROM `coupons` WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    public function getAll() {
        $query = "SELECT * FROM `coupons` ORDER BY `id` DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create($data) {
        $query = "INSERT INTO `coupons` (
            `code`, `name`, `type`, `value`, `max_discount_amount`, 
            `min_order_value`, `applicable_type`, `total_limit`, 
            `per_user_limit`, `is_stackable`, `is_active`, `start_date`, `end_date`
        ) VALUES (
            :code, :name, :type, :value, :max_discount_amount, 
            :min_order_value, :applicable_type, :total_limit, 
            :per_user_limit, :is_stackable, :is_active, :start_date, :end_date
        )";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':code', $data['code'], PDO::PARAM_STR);
        $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
        $stmt->bindValue(':type', $data['type'], PDO::PARAM_STR);
        $stmt->bindValue(':value', $data['value'], PDO::PARAM_STR);
        $stmt->bindValue(':max_discount_amount', $data['max_discount_amount'] ?? null, $data['max_discount_amount'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':min_order_value', $data['min_order_value'] ?? 0.00, PDO::PARAM_STR);
        $stmt->bindValue(':applicable_type', $data['applicable_type'] ?? 'all_orders', PDO::PARAM_STR);
        $stmt->bindValue(':total_limit', $data['total_limit'] ?? null, $data['total_limit'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':per_user_limit', $data['per_user_limit'] ?? 1, PDO::PARAM_INT);
        $stmt->bindValue(':is_stackable', $data['is_stackable'] ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':is_active', $data['is_active'] ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':start_date', $data['start_date'], PDO::PARAM_STR);
        $stmt->bindValue(':end_date', $data['end_date'], PDO::PARAM_STR);

        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE `coupons` SET 
            `code` = :code,
            `name` = :name,
            `type` = :type,
            `value` = :value,
            `max_discount_amount` = :max_discount_amount,
            `min_order_value` = :min_order_value,
            `applicable_type` = :applicable_type,
            `total_limit` = :total_limit,
            `per_user_limit` = :per_user_limit,
            `is_stackable` = :is_stackable,
            `is_active` = :is_active,
            `start_date` = :start_date,
            `end_date` = :end_date
            WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':code', $data['code'], PDO::PARAM_STR);
        $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
        $stmt->bindValue(':type', $data['type'], PDO::PARAM_STR);
        $stmt->bindValue(':value', $data['value'], PDO::PARAM_STR);
        $stmt->bindValue(':max_discount_amount', $data['max_discount_amount'] ?? null, $data['max_discount_amount'] === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':min_order_value', $data['min_order_value'] ?? 0.00, PDO::PARAM_STR);
        $stmt->bindValue(':applicable_type', $data['applicable_type'] ?? 'all_orders', PDO::PARAM_STR);
        $stmt->bindValue(':total_limit', $data['total_limit'] ?? null, $data['total_limit'] === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':per_user_limit', $data['per_user_limit'] ?? 1, PDO::PARAM_INT);
        $stmt->bindValue(':is_stackable', $data['is_stackable'] ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':is_active', $data['is_active'] ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':start_date', $data['start_date'], PDO::PARAM_STR);
        $stmt->bindValue(':end_date', $data['end_date'], PDO::PARAM_STR);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM `coupons` WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function incrementUsedCount($id) {
        $query = "UPDATE `coupons` SET `used_count` = `used_count` + 1 WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function getUserUsageCount($userId, $couponId) {
        if ($userId === null) return 0;
        $query = "SELECT COUNT(*) FROM `orders` WHERE `user_id` = :user_id AND `coupon_id` = :coupon_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function getProducts($couponId) {
        $query = "SELECT `product_id` FROM `coupon_product` WHERE `coupon_id` = :coupon_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function setProducts($couponId, $productIds) {
        // Delete old associations
        $deleteQuery = "DELETE FROM `coupon_product` WHERE `coupon_id` = :coupon_id";
        $stmt = $this->db->prepare($deleteQuery);
        $stmt->bindValue(':coupon_id', $couponId, PDO::PARAM_INT);
        $stmt->execute();

        if (empty($productIds)) return true;

        // Insert new associations
        $insertQuery = "INSERT INTO `coupon_product` (`coupon_id`, `product_id`) VALUES (:coupon_id, :product_id)";
        $stmt = $this->db->prepare($insertQuery);
        $stmt->bindValue(':coupon_id', $couponId, PDO::PARAM_INT);
        
        foreach ($productIds as $prodId) {
            $stmt->bindValue(':product_id', $prodId, PDO::PARAM_INT);
            $stmt->execute();
        }
        return true;
    }
}
