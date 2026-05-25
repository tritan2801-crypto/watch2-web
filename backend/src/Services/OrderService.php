<?php
namespace Services;

use Models\Order;
use Models\Product;
use PDO;
use Exception;

class OrderService {
    private $orderModel;
    private $productModel;
    private $db;
    private $couponModel;
    private $couponService;

    public function __construct(Order $orderModel, Product $productModel, PDO $db, \Models\Coupon $couponModel = null, \Services\CouponService $couponService = null) {
        $this->orderModel = $orderModel;
        $this->productModel = $productModel;
        $this->db = $db;
        $this->couponModel = $couponModel;
        $this->couponService = $couponService;
    }

    public function placeOrder($userId, $items, $shippingAddress, $couponCode = null) {
        if (empty($items)) {
            throw new Exception("Giỏ hàng của bạn đang trống.");
        }
        if (empty($shippingAddress)) {
            throw new Exception("Vui lòng điền địa chỉ giao hàng.");
        }

        // Start transaction
        $this->db->beginTransaction();

        try {
            $totalAmount = 0.00;
            $itemsToProcess = [];

            // Validate all products & calculate prices
            foreach ($items as $item) {
                $productId = $item['product_id'] ?? null;
                $quantity = $item['quantity'] ?? 0;

                if (!$productId || $quantity <= 0) {
                    throw new Exception("Thông tin sản phẩm trong giỏ hàng không hợp lệ.");
                }

                $product = $this->productModel->getById($productId);
                if (!$product) {
                    throw new Exception("Sản phẩm ID #$productId không tồn tại.");
                }

                if ($product['stock'] < $quantity) {
                    throw new Exception("Sản phẩm '{$product['title']}' không đủ hàng trong kho (Còn lại: {$product['stock']}).");
                }

                $price = $product['price'];
                $totalAmount += $price * $quantity;

                $itemsToProcess[] = [
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'price' => $price,
                    'new_stock' => $product['stock'] - $quantity,
                    'product_data' => $product
                ];
            }

            // Calculate and apply coupon discount
            $discountAmount = 0.00;
            $couponId = null;
            if ($couponCode && $this->couponService) {
                try {
                    $couponResult = $this->couponService->validateCoupon($couponCode, $items, $userId);
                    if ($couponResult['success']) {
                        $discountAmount = (float)$couponResult['discount_amount'];
                        $couponId = $couponResult['coupon_id'];
                    }
                } catch (Exception $ce) {
                    throw new Exception("Lỗi áp dụng mã giảm giá: " . $ce->getMessage());
                }
            }

            $finalTotalAmount = max(0.00, $totalAmount - $discountAmount);

            // Create Order
            $orderId = $this->orderModel->create($userId, $finalTotalAmount, $shippingAddress, $couponId, $discountAmount);
            if (!$orderId) {
                throw new Exception("Không thể lưu đơn hàng.");
            }

            // Create Order Items and update Stock
            foreach ($itemsToProcess as $proc) {
                $this->orderModel->addItem($orderId, $proc['product_id'], $proc['quantity'], $proc['price']);

                // Decrement stock
                $pd = $proc['product_data'];
                $this->productModel->update(
                    $proc['product_id'],
                    $pd['title'],
                    $pd['category'],
                    $pd['price'],
                    $pd['size'],
                    $pd['image_url'],
                    $pd['description'],
                    $pd['is_new'],
                    $pd['is_bestseller'],
                    $proc['new_stock']
                );
            }

            // Increment coupon usage
            if ($couponId && $this->couponModel) {
                $this->couponModel->incrementUsedCount($couponId);
            }

            $this->db->commit();

            return [
                'id' => $orderId,
                'total_amount' => $finalTotalAmount,
                'status' => 'pending'
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getUserOrders($userId) {
        $orders = $this->orderModel->getByUserId($userId);
        foreach ($orders as &$order) {
            $order['items'] = $this->orderModel->getItems($order['id']);
            
            // Auto-correct order status based on payment and shipping status
            $status = $order['status'];
            $paymentStatus = $order['payment_status'] ?? 'pending_payment';
            $shippingStatus = $order['shipping_status'] ?? 'pending_shipping';
            
            $newStatus = $status;
            if ($status === 'confirmed' && $paymentStatus === 'paid' && $shippingStatus === 'delivered') {
                $newStatus = 'completed';
            }
            if ($status === 'completed' && ($paymentStatus !== 'paid' || $shippingStatus !== 'delivered')) {
                $newStatus = 'confirmed';
            }
            
            if ($newStatus !== $status) {
                $order['status'] = $newStatus;
                $this->orderModel->updateStatus($order['id'], $newStatus, $paymentStatus, $shippingStatus);
            }
        }
        return $orders;
    }

    public function getAllOrders() {
        $orders = $this->orderModel->getAll();
        foreach ($orders as &$order) {
            $order['items'] = $this->orderModel->getItems($order['id']);
            
            // Auto-correct order status based on payment and shipping status
            $status = $order['status'];
            $paymentStatus = $order['payment_status'] ?? 'pending_payment';
            $shippingStatus = $order['shipping_status'] ?? 'pending_shipping';
            
            $newStatus = $status;
            if ($status === 'confirmed' && $paymentStatus === 'paid' && $shippingStatus === 'delivered') {
                $newStatus = 'completed';
            }
            if ($status === 'completed' && ($paymentStatus !== 'paid' || $shippingStatus !== 'delivered')) {
                $newStatus = 'confirmed';
            }
            
            if ($newStatus !== $status) {
                $order['status'] = $newStatus;
                $this->orderModel->updateStatus($order['id'], $newStatus, $paymentStatus, $shippingStatus);
            }
        }
        return $orders;
    }

    public function updateOrderStatus($id, $status, $paymentStatus, $shippingStatus) {
        if (!$status || !$paymentStatus || !$shippingStatus) {
            throw new Exception("Trạng thái đơn hàng, thanh toán và giao hàng không được trống.");
        }

        // Auto-transition to completed if confirmed, paid, and delivered
        if ($status === 'confirmed' && $paymentStatus === 'paid' && $shippingStatus === 'delivered') {
            $status = 'completed';
        }

        // Auto-transition fallback to confirmed if completed but one condition is revoked
        if ($status === 'completed' && ($paymentStatus !== 'paid' || $shippingStatus !== 'delivered')) {
            $status = 'confirmed';
        }

        $success = $this->orderModel->updateStatus($id, $status, $paymentStatus, $shippingStatus);
        if (!$success) {
            throw new Exception("Không thể cập nhật trạng thái đơn hàng.");
        }
        return true;
    }
}

