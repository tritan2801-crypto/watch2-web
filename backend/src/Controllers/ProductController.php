<?php
namespace Controllers;

use Services\ProductService;
use Exception;

class ProductController {
    private $productService;

    public function __construct(ProductService $productService) {
        $this->productService = $productService;
    }

    public function index() {
        try {
            $products = $this->productService->getAllProducts();
            echo json_encode([
                'success' => true,
                'data' => $products
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function show($id) {
        try {
            if (!$id) {
                throw new Exception("Thiếu mã sản phẩm.");
            }
            $product = $this->productService->getProductById((int)$id);
            echo json_encode([
                'success' => true,
                'data' => $product
            ]);
        } catch (Exception $e) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $product = $this->productService->createProduct($input);
            echo json_encode([
                'success' => true,
                'message' => 'Đã thêm sản phẩm thành công.',
                'data' => $product
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function update($id) {
        try {
            if (!$id) {
                throw new Exception("Thiếu mã sản phẩm.");
            }
            $input = json_decode(file_get_contents('php://input'), true);
            $product = $this->productService->updateProduct((int)$id, $input);
            echo json_encode([
                'success' => true,
                'message' => 'Đã cập nhật sản phẩm thành công.',
                'data' => $product
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function delete($id) {
        try {
            if (!$id) {
                throw new Exception("Thiếu mã sản phẩm.");
            }
            $this->productService->deleteProduct((int)$id);
            echo json_encode([
                'success' => true,
                'message' => 'Đã xóa sản phẩm thành công.'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function renameCategory() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $oldName = $input['old_name'] ?? '';
            $newName = $input['new_name'] ?? '';

            $this->productService->renameCategory($oldName, $newName);
            echo json_encode([
                'success' => true,
                'message' => 'Đã đổi tên danh mục thành công.'
            ]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function deleteCategory() {
        try {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.']);
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $name = $input['name'] ?? '';

            $this->productService->deleteCategory($name);
            echo json_encode([
                'success' => true,
                'message' => 'Đã xóa danh mục thành công.'
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

