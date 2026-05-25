<?php
namespace Controllers;

use Services\CouponService;
use Models\Coupon;
use Exception;

class CouponController {
    private $couponService;
    private $couponModel;

    public function __construct(CouponService $couponService, Coupon $couponModel) {
        $this->couponService = $couponService;
        $this->couponModel = $couponModel;
    }

    /**
     * POST /api/coupons/validate
     */
    public function validate() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $code = $input['code'] ?? '';
            $items = $input['items'] ?? [];
            $appliedCodes = $input['applied_codes'] ?? [];

            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $userId = $_SESSION['user_id'] ?? null;

            $result = $this->couponService->validateCoupon($code, $items, $userId, $appliedCodes);

            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /api/coupons
     */
    public function index() {
        try {
            $this->checkAdminAuth();
            $coupons = $this->couponModel->getAll();
            
            // Hydrate with products list
            foreach ($coupons as &$coupon) {
                $coupon['product_ids'] = $this->couponModel->getProducts($coupon['id']);
                $coupon['is_stackable'] = (bool)$coupon['is_stackable'];
                $coupon['is_active'] = (bool)$coupon['is_active'];
                $coupon['value'] = (float)$coupon['value'];
                $coupon['max_discount_amount'] = $coupon['max_discount_amount'] !== null ? (float)$coupon['max_discount_amount'] : null;
                $coupon['min_order_value'] = (float)$coupon['min_order_value'];
            }

            echo json_encode([
                'success' => true,
                'data' => $coupons
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /api/coupons
     */
    public function create() {
        try {
            $this->checkAdminAuth();
            $input = json_decode(file_get_contents('php://input'), true);

            $this->validateCouponData($input);

            $couponId = $this->couponModel->create($input);
            if (!$couponId) {
                throw new Exception("Không thể thêm mã giảm giá mới.");
            }

            if ($input['applicable_type'] === 'specific_products' && isset($input['product_ids'])) {
                $this->couponModel->setProducts($couponId, $input['product_ids']);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Tạo mã giảm giá thành công.',
                'id' => $couponId
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /api/coupons/:id
     */
    public function update($id) {
        try {
            $this->checkAdminAuth();
            $input = json_decode(file_get_contents('php://input'), true);

            $this->validateCouponData($input);

            $success = $this->couponModel->update((int)$id, $input);
            if (!$success) {
                throw new Exception("Không thể cập nhật mã giảm giá.");
            }

            if ($input['applicable_type'] === 'specific_products' && isset($input['product_ids'])) {
                $this->couponModel->setProducts((int)$id, $input['product_ids']);
            } else {
                $this->couponModel->setProducts((int)$id, []);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Cập nhật mã giảm giá thành công.'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /api/coupons/:id
     */
    public function delete($id) {
        try {
            $this->checkAdminAuth();
            $success = $this->couponModel->delete((int)$id);
            if (!$success) {
                throw new Exception("Không thể xóa mã giảm giá.");
            }

            echo json_encode([
                'success' => true,
                'message' => 'Xóa mã giảm giá thành công.'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * PATCH /api/coupons/:id/toggle
     */
    public function toggle($id) {
        try {
            $this->checkAdminAuth();
            $coupon = $this->couponModel->getById((int)$id);
            if (!$coupon) {
                throw new Exception("Mã giảm giá không tồn tại.");
            }

            $input = $coupon;
            $input['is_active'] = !$coupon['is_active'];

            $success = $this->couponModel->update((int)$id, $input);
            if (!$success) {
                throw new Exception("Không thể thay đổi trạng thái.");
            }

            echo json_encode([
                'success' => true,
                'message' => 'Đã thay đổi trạng thái hoạt động của mã.',
                'is_active' => (bool)$input['is_active']
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function checkAdminAuth() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
            http_response_code(403);
            throw new Exception("Quyền truy cập bị từ chối. Yêu cầu quyền Admin.");
        }
    }

    private function validateCouponData($data) {
        if (empty($data['code'])) throw new Exception("Mã code không được bỏ trống.");
        if (empty($data['name'])) throw new Exception("Tên chiến dịch không được bỏ trống.");
        if (empty($data['type'])) throw new Exception("Loại giảm giá không được bỏ trống.");
        if (!isset($data['value']) || (float)$data['value'] <= 0) throw new Exception("Giá trị giảm giá không hợp lệ.");
        if (empty($data['start_date'])) throw new Exception("Thời gian bắt đầu không được bỏ trống.");
        if (empty($data['end_date'])) throw new Exception("Thời gian kết thúc không được bỏ trống.");
        if ($data['start_date'] > $data['end_date']) throw new Exception("Thời gian bắt đầu phải trước thời gian kết thúc.");
    }
}
