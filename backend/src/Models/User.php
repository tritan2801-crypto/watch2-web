<?php
namespace Models;

use PDO;

class User {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create($email, $passwordHash, $name, $roleId = 2) {
        $query = "INSERT INTO `users` (`email`, `password_hash`, `name`, `role_id`) VALUES (:email, :password_hash, :name, :role_id)";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':role_id', $roleId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    public function getByEmail($email) {
        $query = "SELECT u.*, r.name as role_name 
                  FROM `users` u 
                  LEFT JOIN `roles` r ON u.role_id = r.id 
                  WHERE u.email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getById($id) {
        $query = "SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.created_at 
                  FROM `users` u 
                  LEFT JOIN `roles` r ON u.role_id = r.id 
                  WHERE u.id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getPermissions($userId) {
        $query = "SELECT p.name 
                  FROM `users` u
                  JOIN `role_permissions` rp ON u.role_id = rp.role_id
                  JOIN `permissions` p ON rp.permission_id = p.id
                  WHERE u.id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function updateProfile($id, $email, $name) {
        $query = "UPDATE `users` SET `email` = :email, `name` = :name WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updatePassword($id, $passwordHash) {
        $query = "UPDATE `users` SET `password_hash` = :password_hash WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':password_hash', $passwordHash, PDO::PARAM_STR);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function getPasswordHash($id) {
        $query = "SELECT `password_hash` FROM `users` WHERE `id` = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchColumn();
    }
}
