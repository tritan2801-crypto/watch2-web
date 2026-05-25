<?php
/**
 * RESTful API Router & Entrypoint
 */

// 1. CORS Headers - Allow with Credentials
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:3000';
if ($origin === '*') {
    $origin = 'http://localhost:3000';
}
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Class Autoloader (PSR-4 compliant namespaces)
spl_autoload_register(function ($class) {
    $parts = explode('\\', $class);
    $root = $parts[0];
    
    if ($root === 'Config') {
        $file = dirname(__DIR__) . '/config/' . $parts[1] . '.php';
    } else {
        $file = dirname(__DIR__) . '/src/' . implode('/', $parts) . '.php';
    }
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// 3. Dependency Injection Setup
use Config\Database;
use Models\User;
use Models\Product;
use Models\Order;
use Models\Coupon;
use Services\AuthService;
use Services\ProductService;
use Services\OrderService;
use Services\CouponService;
use Controllers\AuthController;
use Controllers\ProductController;
use Controllers\OrderController;
use Controllers\CouponController;
use Controllers\GoogleAnalyticsController;

try {
    $db = Database::getInstance()->getConnection();
    
    $userModel = new User($db);
    $productModel = new Product($db);
    $orderModel = new Order($db);
    $couponModel = new Coupon($db);
    
    $authService = new AuthService($userModel);
    $productService = new ProductService($productModel);
    $couponService = new CouponService($couponModel, $productModel);
    $orderService = new OrderService($orderModel, $productModel, $db, $couponModel, $couponService);
    
    $authController = new AuthController($authService);
    $productController = new ProductController($productService);
    $orderController = new OrderController($orderService);
    $couponController = new CouponController($couponService, $couponModel);
    $googleAnalyticsController = new GoogleAnalyticsController();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Lỗi kết nối máy chủ CSDL: ' . $e->getMessage()
    ]);
    exit();
}

// 4. API Request Routing
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Standardize route path
// Remove subdirectories if deployed inside a folder (e.g. /demo%20web/watch2-web/backend/public/api/...)
// Under PHP CLI Server 'php -S localhost:8000 -t backend/public', URI is directly /api/...
$path = preg_replace('/^.*?\/api/', '/api', $requestUri);

// Route Matching
if ($path === '/api/products' && $requestMethod === 'GET') {
    $productController->index();
} elseif ($path === '/api/products' && $requestMethod === 'POST') {
    $productController->create();
} elseif (preg_match('/^\/api\/products\/(\d+)$/', $path, $matches) && $requestMethod === 'GET') {
    $productController->show($matches[1]);
} elseif (preg_match('/^\/api\/products\/(\d+)$/', $path, $matches) && $requestMethod === 'PUT') {
    $productController->update($matches[1]);
} elseif (preg_match('/^\/api\/products\/(\d+)$/', $path, $matches) && $requestMethod === 'DELETE') {
    $productController->delete($matches[1]);
} elseif ($path === '/api/auth/register' && $requestMethod === 'POST') {
    $authController->register();
} elseif ($path === '/api/auth/login' && $requestMethod === 'POST') {
    $authController->login();
} elseif ($path === '/api/auth/me' && $requestMethod === 'GET') {
    $authController->me();
} elseif ($path === '/api/auth/profile' && $requestMethod === 'PUT') {
    $authController->updateProfile();
} elseif ($path === '/api/auth/password' && $requestMethod === 'PUT') {
    $authController->updatePassword();
} elseif ($path === '/api/auth/logout' && $requestMethod === 'POST') {
    $authController->logout();
} elseif ($path === '/api/orders' && $requestMethod === 'POST') {
    $orderController->create();
} elseif ($path === '/api/orders/me' && $requestMethod === 'GET') {
    $orderController->userOrders();
} elseif ($path === '/api/orders' && $requestMethod === 'GET') {
    $orderController->allOrders();
} elseif (preg_match('/^\/api\/orders\/(\d+)$/', $path, $matches) && $requestMethod === 'PUT') {
    $orderController->update($matches[1]);
} elseif ($path === '/api/categories' && $requestMethod === 'PUT') {
    $productController->renameCategory();
} elseif ($path === '/api/categories' && $requestMethod === 'DELETE') {
    $productController->deleteCategory();
} elseif ($path === '/api/coupons/validate' && $requestMethod === 'POST') {
    $couponController->validate();
} elseif ($path === '/api/coupons' && $requestMethod === 'GET') {
    $couponController->index();
} elseif ($path === '/api/coupons' && $requestMethod === 'POST') {
    $couponController->create();
} elseif (preg_match('/^\/api\/coupons\/(\d+)$/', $path, $matches) && $requestMethod === 'PUT') {
    $couponController->update($matches[1]);
} elseif (preg_match('/^\/api\/coupons\/(\d+)$/', $path, $matches) && $requestMethod === 'DELETE') {
    $couponController->delete($matches[1]);
} elseif (preg_match('/^\/api\/coupons\/(\d+)\/toggle$/', $path, $matches) && $requestMethod === 'PATCH') {
    $couponController->toggle($matches[1]);
} elseif (strpos($path, '/api/google-analytics') === 0) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    if (!isset($_SESSION['user_id']) || ($_SESSION['user_email'] ?? '') !== 'admin@mvmt.com') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Quyền truy cập bị từ chối. Yêu cầu quyền Admin.']);
        exit();
    }
    if ($path === '/api/google-analytics/report' && $requestMethod === 'GET') {
        $googleAnalyticsController->getReport();
    } elseif ($path === '/api/google-analytics/config' && $requestMethod === 'POST') {
        $googleAnalyticsController->saveConfig();
    } elseif ($path === '/api/google-analytics/export' && $requestMethod === 'GET') {
        $googleAnalyticsController->exportExcel();
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'API endpoint không tồn tại.']);
    }
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'API endpoint không tồn tại: ' . $path
    ]);
}

