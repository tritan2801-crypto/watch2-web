<?php
namespace Models;

use PDO;

class Product {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM `products` ORDER BY `id` DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "SELECT * FROM `products` WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($title, $category, $price, $size, $image_url, $description = null, $is_new = 0, $is_bestseller = 0, $stock = 10) {
        $query = "INSERT INTO `products` (`title`, `category`, `price`, `size`, `image_url`, `description`, `is_new`, `is_bestseller`, `stock`) 
                  VALUES (:title, :category, :price, :size, :image_url, :description, :is_new, :is_bestseller, :stock)";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':title', $title, PDO::PARAM_STR);
        $stmt->bindValue(':category', $category, PDO::PARAM_STR);
        $stmt->bindValue(':price', $price, PDO::PARAM_STR);
        $stmt->bindValue(':size', $size, PDO::PARAM_STR);
        $stmt->bindValue(':image_url', $image_url, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        $stmt->bindValue(':is_new', $is_new, PDO::PARAM_INT);
        $stmt->bindValue(':is_bestseller', $is_bestseller, PDO::PARAM_INT);
        $stmt->bindValue(':stock', $stock, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function update($id, $title, $category, $price, $size, $image_url, $description = null, $is_new = 0, $is_bestseller = 0, $stock = 10) {
        $query = "UPDATE `products` SET 
                  `title` = :title, 
                  `category` = :category, 
                  `price` = :price, 
                  `size` = :size, 
                  `image_url` = :image_url, 
                  `description` = :description, 
                  `is_new` = :is_new, 
                  `is_bestseller` = :is_bestseller, 
                  `stock` = :stock 
                  WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->bindValue(':title', $title, PDO::PARAM_STR);
        $stmt->bindValue(':category', $category, PDO::PARAM_STR);
        $stmt->bindValue(':price', $price, PDO::PARAM_STR);
        $stmt->bindValue(':size', $size, PDO::PARAM_STR);
        $stmt->bindValue(':image_url', $image_url, PDO::PARAM_STR);
        $stmt->bindValue(':description', $description, PDO::PARAM_STR);
        $stmt->bindValue(':is_new', $is_new, PDO::PARAM_INT);
        $stmt->bindValue(':is_bestseller', $is_bestseller, PDO::PARAM_INT);
        $stmt->bindValue(':stock', $stock, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM `products` WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function renameCategory($oldName, $newName) {
        $query = "UPDATE `products` SET `category` = :new_name WHERE `category` = :old_name";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':old_name', $oldName, PDO::PARAM_STR);
        $stmt->bindValue(':new_name', $newName, PDO::PARAM_STR);
        return $stmt->execute();
    }

    public function deleteCategory($name) {
        $query = "DELETE FROM `products` WHERE `category` = :category";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':category', $name, PDO::PARAM_STR);
        return $stmt->execute();
    }
}

