<?php
namespace Services;

use Models\Coupon;
use Models\Product;
use Exception;

class CouponService {
    private $couponModel;
    private $productModel;

    public function __construct(Coupon $couponModel, Product $productModel) {
        $this->couponModel = $couponModel;
        $this->productModel = $productModel;
    }

    /**
     * Validate a promo code against the cart and customer limits
     * 
     * @param string $code The promo code to validate
     * @param array $items Array of cart items: [['product_id' => 12, 'quantity' => 2], ...]
     * @param int|null $userId The authenticated user ID (null for guests)
     * @param array $appliedCodes Array of already applied coupon codes in the cart
     * @return array Validation result with discount details
     * @throws Exception if validation fails
     */
    public function validateCoupon($code, $items, $userId = null, $appliedCodes = []) {
        $code = trim(strtoupper($code));
        if (empty($code)) {
            throw new Exception("Mã giảm giá không được bỏ trống.");
        }

        // 1. Existence & Status
        $coupon = $this->couponModel->getByCode($code);
        if (!$coupon) {
            throw new Exception("Mã giảm giá không tồn tại.");
        }

        if (!$coupon['is_active']) {
            throw new Exception("Mã giảm giá hiện đang bị vô hiệu hóa.");
        }

        $now = date('Y-m-d H:i:s');
        if ($now < $coupon['start_date'] || $now > $coupon['end_date']) {
            throw new Exception("Mã giảm giá đã hết hạn hoặc chưa đến thời gian kích hoạt.");
        }

        // 2. Global & User Limits
        if ($coupon['total_limit'] !== null && $coupon['used_count'] >= $coupon['total_limit']) {
            throw new Exception("Mã giảm giá đã đạt giới hạn lượt sử dụng tối đa.");
        }

        if ($userId !== null) {
            $userUsage = $this->couponModel->getUserUsageCount($userId, $coupon['id']);
            if ($userUsage >= $coupon['per_user_limit']) {
                throw new Exception("Tài khoản của bạn đã sử dụng mã này đạt giới hạn tối đa (" . $coupon['per_user_limit'] . " lần).");
            }
        }

        // Calculate Cart subtotal and gather product details
        $subtotal = 0.00;
        $productDetails = [];
        foreach ($items as $item) {
            $productId = $item['product_id'] ?? null;
            $quantity = $item['quantity'] ?? 0;
            if (!$productId || $quantity <= 0) continue;

            $product = $this->productModel->getById($productId);
            if ($product) {
                $subtotal += $product['price'] * $quantity;
                $productDetails[$productId] = [
                    'price' => (float)$product['price'],
                    'quantity' => $quantity
                ];
            }
        }

        // 3. Cart Threshold
        if ($subtotal < (float)$coupon['min_order_value']) {
            throw new Exception("Giá trị đơn hàng chưa đạt mức tối thiểu ($" . number_format($coupon['min_order_value'], 2) . ") để áp dụng mã.");
        }

        // 4. Stacking Rule
        if (!empty($appliedCodes)) {
            // If the incoming coupon is not stackable, or if any of the already applied coupons are not stackable
            if (!$coupon['is_stackable']) {
                throw new Exception("Mã giảm giá không thể dùng chung với mã hiện tại.");
            }
            foreach ($appliedCodes as $appCode) {
                if (strcasecmp($appCode, $code) === 0) {
                    throw new Exception("Mã giảm giá này đã được áp dụng.");
                }
                $existingCoupon = $this->couponModel->getByCode($appCode);
                if ($existingCoupon && !$existingCoupon['is_stackable']) {
                    throw new Exception("Mã giảm giá không thể dùng chung với mã hiện tại.");
                }
            }
        }

        // 5. Deduction Calculation
        $discountAmount = 0.00;
        if ($coupon['applicable_type'] === 'all_orders') {
            // Apply on subtotal
            if ($coupon['type'] === 'percentage') {
                $discountAmount = $subtotal * ((float)$coupon['value'] / 100);
                if ($coupon['max_discount_amount'] !== null) {
                    $discountAmount = min($discountAmount, (float)$coupon['max_discount_amount']);
                }
            } else { // fixed
                $discountAmount = (float)$coupon['value'];
            }
        } else { // specific_products
            $eligibleProductIds = $this->couponModel->getProducts($coupon['id']);
            if (empty($eligibleProductIds)) {
                throw new Exception("Mã giảm giá này không áp dụng cho bất kỳ sản phẩm nào.");
            }

            $eligibleSubtotal = 0.00;
            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                if ($productId && in_array($productId, $eligibleProductIds) && isset($productDetails[$productId])) {
                    $eligibleSubtotal += $productDetails[$productId]['price'] * $productDetails[$productId]['quantity'];
                }
            }

            if ($eligibleSubtotal <= 0.00) {
                throw new Exception("Đơn hàng của bạn không chứa sản phẩm đủ điều kiện áp dụng mã này.");
            }

            if ($coupon['type'] === 'percentage') {
                $discountAmount = $eligibleSubtotal * ((float)$coupon['value'] / 100);
                if ($coupon['max_discount_amount'] !== null) {
                    $discountAmount = min($discountAmount, (float)$coupon['max_discount_amount']);
                }
            } else { // fixed
                $discountAmount = min((float)$coupon['value'], $eligibleSubtotal);
            }
        }

        // Cap discount to subtotal
        $discountAmount = min($discountAmount, $subtotal);

        return [
            'success' => true,
            'coupon_id' => $coupon['id'],
            'code' => $coupon['code'],
            'name' => $coupon['name'],
            'type' => $coupon['type'],
            'value' => (float)$coupon['value'],
            'discount_amount' => round($discountAmount, 2),
            'applicable_type' => $coupon['applicable_type'],
            'is_stackable' => (bool)$coupon['is_stackable']
        ];
    }
}
