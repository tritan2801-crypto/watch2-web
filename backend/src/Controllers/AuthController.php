<?php
namespace Controllers;

use Services\AuthService;
use Exception;

class AuthController {
    private $authService;

    public function __construct(AuthService $authService) {
        $this->authService = $authService;
    }

    public function register() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';
            $name = $input['name'] ?? '';

            $user = $this->authService->register($email, $password, $name);
            
            echo json_encode([
                'success' => true,
                'message' => 'Đăng ký tài khoản thành công.',
                'data' => $user
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function login() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $password = $input['password'] ?? '';

            $sessionData = $this->authService->login($email, $password);

            echo json_encode([
                'success' => true,
                'message' => 'Đăng nhập thành công.',
                'data' => $sessionData
            ]);
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function me() {
        try {
            $user = $this->authService->getCurrentUser();
            if (!$user) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Chưa đăng nhập.'
                ]);
                return;
            }

            echo json_encode([
                'success' => true,
                'data' => $user
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function logout() {
        try {
            $this->authService->logout();
            echo json_encode([
                'success' => true,
                'message' => 'Đã đăng xuất.'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updateProfile() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Chưa đăng nhập.'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $email = $input['email'] ?? '';
            $name = $input['name'] ?? '';

            $user = $this->authService->updateProfile($userId, $email, $name);

            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật thông tin thành công.',
                'data' => $user
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function updatePassword() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Chưa đăng nhập.'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $currentPassword = $input['current_password'] ?? '';
            $newPassword = $input['new_password'] ?? '';

            $this->authService->updatePassword($userId, $currentPassword, $newPassword);

            echo json_encode([
                'success' => true,
                'message' => 'Đổi mật khẩu thành công.'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}
