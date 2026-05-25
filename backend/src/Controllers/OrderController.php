<?php
namespace Controllers;

use Services\OrderService;
use Exception;

class OrderController {
    private $orderService;

    public function __construct(OrderService $orderService) {
        $this->orderService = $orderService;
    }

    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $items = $input['items'] ?? [];
            $shippingAddress = $input['shipping_address'] ?? '';
            $couponCode = $input['coupon_code'] ?? null;

            // Check if user is logged in
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $userId = $_SESSION['user_id'] ?? null; // Allows guest checkout if null

            $orderResult = $this->orderService->placeOrder($userId, $items, $shippingAddress, $couponCode);

            echo json_encode([
                'success' => true,
                'message' => 'Đặt hàng thành công.',
                'data' => $orderResult
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function userOrders() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            if (!isset($_SESSION['user_id'])) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Vui lòng đăng nhập để xem lịch sử mua hàng.'
                ]);
                return;
            }

            $orders = $this->orderService->getUserOrders($_SESSION['user_id']);
            
            echo json_encode([
                'success' => true,
                'data' => $orders
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function allOrders() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.'
                ]);
                return;
            }

            $orders = $this->orderService->getAllOrders();
            
            echo json_encode([
                'success' => true,
                'data' => $orders
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function update($id) {
        try {
            if (!$id) {
                throw new Exception("Thiếu mã đơn hàng.");
            }

            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'error' => 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.'
                ]);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $status = $input['status'] ?? null;
            $paymentStatus = $input['payment_status'] ?? null;
            $shippingStatus = $input['shipping_status'] ?? null;

            $this->orderService->updateOrderStatus((int)$id, $status, $paymentStatus, $shippingStatus);

            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công.'
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

