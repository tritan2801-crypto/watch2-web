<?php
namespace Services;

use Models\User;
use Exception;

class AuthService {
    private $userModel;

    public function __construct(User $userModel) {
        $this->userModel = $userModel;
    }

    public function register($email, $password, $name) {
        if (empty($email) || empty($password) || empty($name)) {
            throw new Exception("Vui lòng điền đầy đủ các thông tin bắt buộc.");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Định dạng email không hợp lệ.");
        }

        if (strlen($password) < 6) {
            throw new Exception("Mật khẩu phải chứa ít nhất 6 ký tự.");
        }

        // Check if user already exists
        $existingUser = $this->userModel->getByEmail($email);
        if ($existingUser) {
            throw new Exception("Email này đã được sử dụng.");
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $userId = $this->userModel->create($email, $passwordHash, $name, 2); // 2 is regular Customer role
        if (!$userId) {
            throw new Exception("Không thể đăng ký tài khoản mới.");
        }

        return [
            'id' => $userId,
            'email' => $email,
            'name' => $name
        ];
    }

    public function login($email, $password) {
        if (empty($email) || empty($password)) {
            throw new Exception("Vui lòng điền đầy đủ email và mật khẩu.");
        }

        $user = $this->userModel->getByEmail($email);
        if (!$user) {
            throw new Exception("Email hoặc mật khẩu không chính xác.");
        }

        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception("Email hoặc mật khẩu không chính xác.");
        }

        // Start session and save state
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_role'] = $user['role_name'];

        return [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role_name']
        ];
    }

    public function getCurrentUser() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            return null;
        }

        $user = $this->userModel->getById($_SESSION['user_id']);
        if (!$user) {
            return null;
        }

        // Retrieve permissions
        $permissions = $this->userModel->getPermissions($user['id']);
        $user['permissions'] = $permissions;

        return $user;
    }

    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Unset session variables
        $_SESSION = [];
        
        // Destroy session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        // Destroy session
        session_destroy();
        return true;
    }

    public function updateProfile($userId, $email, $name) {
        if (empty($email) || empty($name)) {
            throw new Exception("Vui lòng điền đầy đủ họ tên và email.");
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Định dạng email không hợp lệ.");
        }

        // Check if email is already taken by another user
        $existingUser = $this->userModel->getByEmail($email);
        if ($existingUser && $existingUser['id'] != $userId) {
            throw new Exception("Email này đã được sử dụng bởi tài khoản khác.");
        }

        $success = $this->userModel->updateProfile($userId, $email, $name);
        if (!$success) {
            throw new Exception("Không thể cập nhật thông tin tài khoản.");
        }

        // Update session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $name;

        return [
            'id' => $userId,
            'email' => $email,
            'name' => $name
        ];
    }

    public function updatePassword($userId, $currentPassword, $newPassword) {
        if (empty($currentPassword) || empty($newPassword)) {
            throw new Exception("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.");
        }

        if (strlen($newPassword) < 6) {
            throw new Exception("Mật khẩu mới phải chứa ít nhất 6 ký tự.");
        }

        // Retrieve current password hash
        $passwordHash = $this->userModel->getPasswordHash($userId);
        if (!$passwordHash) {
            throw new Exception("Không tìm thấy tài khoản người dùng.");
        }

        // Verify current password
        if (!password_verify($currentPassword, $passwordHash)) {
            throw new Exception("Mật khẩu hiện tại không chính xác.");
        }

        // Hash and save new password
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $success = $this->userModel->updatePassword($userId, $newHash);
        if (!$success) {
            throw new Exception("Không thể đổi mật khẩu.");
        }

        return true;
    }
}
