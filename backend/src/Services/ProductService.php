<?php
namespace Services;

use Models\Product;
use Exception;

class ProductService {
    private $productModel;

    public function __construct(Product $productModel) {
        $this->productModel = $productModel;
    }

    public function getAllProducts() {
        return $this->productModel->getAll();
    }

    public function getProductById($id) {
        $product = $this->productModel->getById($id);
        if (!$product) {
            throw new Exception("Sản phẩm không tồn tại.");
        }
        return $product;
    }

    public function createProduct($data) {
        $title = $data['title'] ?? '';
        $category = $data['category'] ?? '';
        $price = $data['price'] ?? 0;
        $size = $data['size'] ?? '';
        $image_url = $data['image_url'] ?? '';
        $description = $data['description'] ?? null;
        $is_new = isset($data['is_new']) ? (int)$data['is_new'] : 0;
        $is_bestseller = isset($data['is_bestseller']) ? (int)$data['is_bestseller'] : 0;
        $stock = isset($data['stock']) ? (int)$data['stock'] : 10;

        if (empty($title) || empty($category) || empty($price)) {
            throw new Exception("Vui lòng điền tiêu đề, danh mục và giá sản phẩm.");
        }

        $id = $this->productModel->create($title, $category, $price, $size, $image_url, $description, $is_new, $is_bestseller, $stock);
        if (!$id) {
            throw new Exception("Không thể tạo sản phẩm mới.");
        }
        return $this->getProductById($id);
    }

    public function updateProduct($id, $data) {
        $product = $this->getProductById($id); // ensure exists
        
        $title = $data['title'] ?? $product['title'];
        $category = $data['category'] ?? $product['category'];
        $price = $data['price'] ?? $product['price'];
        $size = $data['size'] ?? $product['size'];
        $image_url = $data['image_url'] ?? $product['image_url'];
        $description = array_key_exists('description', $data) ? $data['description'] : $product['description'];
        $is_new = isset($data['is_new']) ? (int)$data['is_new'] : (int)$product['is_new'];
        $is_bestseller = isset($data['is_bestseller']) ? (int)$data['is_bestseller'] : (int)$product['is_bestseller'];
        $stock = isset($data['stock']) ? (int)$data['stock'] : (int)$product['stock'];

        if (empty($title) || empty($category) || empty($price)) {
            throw new Exception("Vui lòng điền tiêu đề, danh mục và giá sản phẩm.");
        }

        $success = $this->productModel->update($id, $title, $category, $price, $size, $image_url, $description, $is_new, $is_bestseller, $stock);
        if (!$success) {
            throw new Exception("Không thể cập nhật sản phẩm.");
        }
        return $this->getProductById($id);
    }

    public function deleteProduct($id) {
        $this->getProductById($id); // ensure exists
        $success = $this->productModel->delete($id);
        if (!$success) {
            throw new Exception("Không thể xóa sản phẩm.");
        }
        return true;
    }

    public function renameCategory($oldName, $newName) {
        if (empty($oldName) || empty($newName)) {
            throw new Exception("Tên danh mục không được để trống.");
        }
        return $this->productModel->renameCategory($oldName, $newName);
    }

    public function deleteCategory($name) {
        if (empty($name)) {
            throw new Exception("Tên danh mục không được để trống.");
        }
        return $this->productModel->deleteCategory($name);
    }
}

