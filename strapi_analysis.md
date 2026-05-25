# Phân Tích Chuyên Sâu Hệ Thống Aura Studio (Strapi 5 + PostgreSQL) & Hướng Dẫn Chuyển Đổi Sang PHP Thuần

Tài liệu này thực hiện phân tích chuyên sâu về cấu trúc thư mục, logic hoạt động, cơ chế bảo mật, GA4 tracking và hướng dẫn chi tiết cách tích hợp, chuyển đổi các logic này sang ngôn ngữ **PHP thuần** (không phụ thuộc thư viện bên thứ ba).

---

## I. Kiến Trúc & Logic Hoạt Động Của Hệ Thống

Dự án AURA Studio nằm trong thư mục [strapi-file](file:///h:/demo%20web/watch2-web/strapi-file) bao gồm 3 cấu phần chính chạy trong môi trường Container Docker:
1. **Frontend (Next.js 15 App Router)**: Hiển thị giao diện người dùng, sử dụng Tailwind CSS v4, tối ưu hóa SEO và tải trang nhanh.
2. **Backend (Strapi 5 Headless CMS)**: Quản trị nội dung (Sản phẩm, Danh mục, Banner, Cài đặt website, Đơn hàng) và cung cấp các API REST.
3. **Database (PostgreSQL 16)**: Lưu trữ cơ sở dữ liệu độc lập cho Strapi.

### 1. Cơ Chế Tự Động Khởi Tạo & Seed Dữ Liệu (Bootstrap Seeder)
Logic này được định nghĩa tại tệp [backend/src/index.ts](file:///h:/demo%20web/watch2-web/strapi-file/backend/src/index.ts). Khi container backend khởi động lần đầu:
* **Tự động cấu hình phân quyền (API Permissions)**: Tìm kiếm vai trò `public` (khách vãng lai) và tự động tạo bản ghi cấp quyền gọi các API lấy danh mục, sản phẩm, banner, cài đặt site, và endpoint checkout mà không cần quản trị viên phải vào trang admin click thủ công.
* **Tạo dữ liệu mẫu**: Nếu cơ sở dữ liệu trống, nó sẽ tự động nạp cấu hình website mặc định, tạo 4 danh mục thời trang chính, 2 banner trang chủ, 8 sản phẩm mẫu (có giá niêm yết và giá khuyến mãi) và 2 đơn hàng mẫu để hiển thị biểu đồ phân tích.

### 2. Logic Thanh Toán & Kiểm Tra Giá Máy Chủ (Server-Side Price Verification)
* **Tệp tin**: [checkout.ts Controller](file:///h:/demo%20web/watch2-web/strapi-file/backend/src/api/checkout/controllers/checkout.ts)
* **Vấn đề bảo mật**: Trên các website thương mại điện tử, nếu khách hàng gửi thẳng thông tin đơn hàng cùng với giá tiền lên server, họ có thể sửa đổi giá tiền (ví dụ: sửa giá sản phẩm từ 1.000.000đ thành 1.000đ bằng công cụ F12 hoặc Postman).
* **Logic hoạt động**:
  1. Quyền ghi trực tiếp đơn hàng lên `/api/orders` bị khóa với vai trò Public. Khách hàng bắt buộc phải gửi yêu cầu dạng POST đến endpoint tùy biến `/api/checkout`.
  2. Dữ liệu gửi đi chỉ bao gồm: Thông tin khách hàng (`customerName`, `phone`, `address`, `note`) và danh sách sản phẩm chỉ chứa ID cùng số lượng (`productId`, `quantity`).
  3. Controller tại backend sẽ truy vấn cơ sở dữ liệu dựa trên `productId` để lấy giá chính xác nhất đang lưu hành (chọn giá khuyến mãi `salePrice` nếu có, nếu không thì lấy giá gốc `price`).
  4. Server tự tính tổng tiền (`totalAmount`) và ghi nhận đơn hàng trạng thái `pending` vào bảng `orders`.

### 3. Logic Gửi Sự Kiện Purchase về GA4 (Measurement Protocol)
Cũng tại [checkout.ts Controller](file:///h:/demo%20web/watch2-web/strapi-file/backend/src/api/checkout/controllers/checkout.ts#L91-L138), khi đơn hàng lưu thành công:
* Server sẽ gửi một request HTTP POST bất đồng bộ (không chặn luồng phản hồi của khách hàng) tới Google Analytics bằng giao thức **Measurement Protocol**.
* API Endpoint: `https://www.google-analytics.com/mp/collect?measurement_id=G-98DRW31N5G&api_secret=IoUh4HcwTgWzuuVuJgfxjg`
* Payload bao gồm thông tin đơn hàng chuẩn hóa: `transaction_id`, tổng giá trị `value`, tiền tệ `VND` và danh sách các sản phẩm (`items`) đã mua để Google Analytics 4 ghi nhận sự kiện chuyển đổi Ecommerce ngay cả khi khách hàng thanh toán dạng COD (không cần qua cổng thanh toán).

### 4. Cơ Chế Xác Thực OAuth2 & Lấy Báo Cáo GA4 (GA4 Reporting API)
* **Tệp tin**: [google-analytics.ts Controller](file:///h:/demo%20web/watch2-web/strapi-file/backend/src/api/google-analytics/controllers/google-analytics.ts)
* **Logic hoạt động**:
  1. Sử dụng tệp khóa dịch vụ Google Service Account (`google-credentials.json`) và ID thuộc tính GA4 (`google-property-id.txt`).
  2. Tạo mã **JSON Web Token (JWT)** với thuật toán mã hóa `RS256` sử dụng chữ ký khóa tư nhân (`private_key`) của Service Account.
  3. Gửi JWT này tới `https://oauth2.googleapis.com/token` để đổi lấy mã truy cập tạm thời `access_token` (hiệu lực 3600 giây).
  4. Dùng `access_token` làm mã xác thực Header (`Authorization: Bearer <token>`) để gửi yêu cầu lấy dữ liệu thống kê từ Google Analytics Data API v1beta (`https://analyticsdata.googleapis.com/v1beta/properties/<propertyId>:runReport`).
  5. Nếu cấu hình thiếu hoặc lỗi kết nối đến máy chủ Google, hệ thống sẽ tự động sinh dữ liệu giả lập chất lượng cao (Simulated fallback data) kết hợp doanh thu thực tế từ cơ sở dữ liệu local để giao diện quản trị không bao giờ bị lỗi hoặc trắng trang.

---

## II. Cách Lấy Thông Tin Từ API Strapi 5

Strapi 5 cung cấp tài liệu REST API chuẩn hóa. Dưới đây là các phương thức lấy thông tin cốt lõi mà Client gọi:

### 1. Lấy Danh Sách Sản Phẩm (Products)
* **Endpoint**: `GET http://localhost:1337/api/products`
* **Query Parameters phổ biến**:
  * `?populate=*`: Tải kèm toàn bộ quan hệ (như hình ảnh hoặc danh mục liên kết).
  * `?filters[isActive][$eq]=true`: Lọc các sản phẩm đang hiển thị kinh doanh.
  * `?filters[category][slug][$eq]=ao-thun`: Lọc các sản phẩm thuộc danh mục có slug là "ao-thun".
  * `?sort[0]=price:asc`: Sắp xếp giá tăng dần.

### 2. Cấu Trúc Dữ Liệu Trả Về từ Strapi 5
Cấu trúc phản hồi JSON của Strapi 5 có dạng:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "xyz789...",
      "name": "Áo Thun Organic Basic",
      "slug": "ao-thun-organic-basic",
      "price": 290000,
      "salePrice": 190000,
      "stockStatus": "in_stock",
      "isActive": true,
      "createdAt": "2026-05-25T...",
      "category": {
        "id": 1,
        "name": "Áo thun",
        "slug": "ao-thun"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 8
    }
  }
}
```
*Lưu ý: Trong Strapi 5, các trường dữ liệu nằm trực tiếp trong đối tượng của mảng `data` chứ không bọc qua thuộc tính `attributes` như ở Strapi 4.*

---

## III. Cách Triển Khai Trên PHP Thuần (Pure PHP)

Dưới đây là mã nguồn PHP thuần giúp bạn chuyển đổi toàn bộ logic hoạt động của file Javascript/TypeScript sang PHP để chạy trên các dự án PHP truyền thống mà không cần Node.js.

### 1. PHP Class: `StrapiClient` - Lấy Thông Tin Sản Phẩm & Danh Mục
Class này thực hiện kết nối, gửi yêu cầu GET và giải mã dữ liệu từ Strapi API.

```php
<?php
/**
 * StrapiClient.php
 * Lớp kết nối REST API Strapi 5 bằng PHP thuần dùng cURL
 */
class StrapiClient {
    private $apiBaseUrl;

    public function __construct($baseUrl = 'http://localhost:1337/api') {
        $this->apiBaseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Gửi yêu cầu HTTP GET đến Strapi
     */
    private function get($endpoint, $params = []) {
        $queryString = !empty($params) ? '?' . http_build_query($params) : '';
        $url = $this->apiBaseUrl . '/' . ltrim($endpoint, '/') . $queryString;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Lỗi gọi API Strapi [HTTP Code $httpCode]: " . $response);
        }

        return json_decode($response, true);
    }

    /**
     * Lấy toàn bộ danh mục đang hoạt động
     */
    public function getCategories() {
        $params = [
            'filters[isActive][$eq]' => 'true'
        ];
        $res = $this->get('/categories', $params);
        return isset($res['data']) ? $res['data'] : [];
    }

    /**
     * Lấy danh sách sản phẩm kèm theo danh mục
     */
    public function getProducts($categorySlug = null, $page = 1, $pageSize = 12) {
        $params = [
            'filters[isActive][$eq]' => 'true',
            'populate' => 'category',
            'pagination[page]' => $page,
            'pagination[pageSize]' => $pageSize
        ];

        if ($categorySlug) {
            $params['filters[category][slug][$eq]'] = $categorySlug;
        }

        $res = $this->get('/products', $params);
        return [
            'items' => isset($res['data']) ? $res['data'] : [],
            'pagination' => isset($res['meta']['pagination']) ? $res['meta']['pagination'] : []
        ];
    }

    /**
     * Chi tiết sản phẩm theo Slug
     */
    public function getProductBySlug($slug) {
        $params = [
            'filters[slug][$eq]' => $slug,
            'populate' => 'category',
            'pagination[limit]' => 1
        ];

        $res = $this->get('/products', $params);
        if (!empty($res['data'])) {
            return $res['data'][0];
        }
        return null;
    }
}

// --- Hướng dẫn sử dụng thử ---
// $client = new StrapiClient('http://localhost:1337/api');
// $products = $client->getProducts('ao-thun');
// print_r($products['items']);
```

---

### 2. PHP Checkout: Gửi Đơn Hàng Sang Endpoint Checkout Bảo Mật
Gửi thông tin giỏ hàng của người dùng lên server để xác minh giá và lưu đơn.

```php
<?php
/**
 * checkout.php
 * Gửi yêu cầu đặt hàng lên Strapi Checkout Endpoint bằng PHP thuần
 */

function submitOrderToStrapi($customerData, $cartItems) {
    $apiUrl = 'http://localhost:1337/api/checkout';

    // Chuẩn bị payload gửi đi (không gửi giá tiền, chỉ gửi productId và quantity)
    $payload = [
        'customerName' => $customerData['name'],
        'phone'        => $customerData['phone'],
        'address'      => $customerData['address'],
        'note'         => isset($customerData['note']) ? $customerData['note'] : '',
        'items'        => array_map(function($item) {
            return [
                'productId' => (int)$item['productId'],
                'quantity'  => (int)$item['quantity']
            ];
        }, $cartItems)
    ];

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode !== 200) {
        $errorMessage = isset($result['error']['message']) ? $result['error']['message'] : $response;
        return [
            'success' => false,
            'error' => "Lỗi xử lý đơn hàng [$httpCode]: " . $errorMessage
        ];
    }

    return [
        'success' => true,
        'order' => $result['order']
    ];
}

// --- Ví dụ gọi hàm ---
// $customer = [
//     'name' => 'Lê Văn C',
//     'phone' => '0987654321',
//     'address' => '321 Điện Biên Phủ, Bình Thạnh, TP.HCM',
//     'note' => 'Giao hàng sau 5h chiều'
// ];
// $cart = [
//     ['productId' => 1, 'quantity' => 2], // Áo thun
//     ['productId' => 3, 'quantity' => 1]  // Áo sơ mi
// ];
// $orderResult = submitOrderToStrapi($customer, $cart);
// print_r($orderResult);
```

---

### 3. PHP GA4 Tracking: Gửi Sự Kiện Mua Hàng Lên Google Analytics
Đoạn mã PHP thực hiện gửi yêu cầu HTTP POST độc lập đến GA4 Measurement Protocol mô phỏng cơ chế tracking ngầm của Strapi.

```php
<?php
/**
 * ga4_tracking.php
 * Gửi sự kiện Purchase về Google Analytics 4 từ Backend bằng PHP thuần
 */

function trackPurchaseGA4($orderId, $totalAmount, $computedItems, $clientPhone) {
    $measurementId = 'G-98DRW31N5G';
    $apiSecret = 'IoUh4HcwTgWzuuVuJgfxjg';

    // Tạo Client ID bằng cách chuẩn hóa số điện thoại hoặc dùng mã ẩn danh
    $clientId = preg_replace('/[^0-9]/', '', $clientPhone);
    if (empty($clientId)) {
        $clientId = 'anonymous_php_client';
    }

    // Thiết lập cấu trúc Payload theo chuẩn GA4 Measurement Protocol
    $payload = [
        'client_id' => $clientId,
        'events' => [
            [
                'name' => 'purchase',
                'params' => [
                    'transaction_id' => (string)$orderId,
                    'value' => (float)$totalAmount,
                    'currency' => 'VND',
                    'items' => array_map(function($item) {
                        return [
                            'item_id' => (string)$item['productId'],
                            'item_name' => $item['name'],
                            'price' => (float)$item['unitPrice'],
                            'quantity' => (int)$item['quantity']
                        ];
                    }, $computedItems)
                ]
            ]
        ]
    ];

    $url = "https://www.google-analytics.com/mp/collect?measurement_id={$measurementId}&api_secret={$apiSecret}";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout ngắn để tránh nghẽn
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ($httpCode === 200 || $httpCode === 204);
}
```

---

### 4. PHP Google OAuth2 & GA4 Report: Ký JWT RS256 và Lấy Báo Cáo
Chức năng phức tạp nhất: Đọc tệp tin JSON Service Account, sinh mã JWT đã ký bằng khóa tư nhân của Google thông qua thư viện OpenSSL có sẵn của PHP, đổi Token và chạy truy vấn báo cáo.

```php
<?php
/**
 * ga4_report.php
 * Ký mã JWT dùng thuật toán RS256 và lấy dữ liệu Google Analytics 4 từ PHP thuần
 */

/**
 * Mã hóa chuỗi dạng Base64URL
 */
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

/**
 * Tạo Google OAuth2 Access Token bằng cách tự ký JWT RS256 dùng OpenSSL
 */
function getGoogleAccessToken($clientEmail, $privateKeyPem) {
    $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
    $now = time();
    $payload = json_encode([
        'iss' => $clientEmail,
        'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
        'aud' => 'https://oauth2.googleapis.com/token',
        'exp' => $now + 3600,
        'iat' => $now
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signatureInput = $base64UrlHeader . "." . $base64UrlPayload;

    $signature = '';
    // Sử dụng extension OpenSSL tích hợp sẵn của PHP để ký khóa riêng bằng thuật toán SHA256
    $pkeyId = openssl_pkey_get_private($privateKeyPem);
    if (!$pkeyId) {
        throw new Exception("Không thể đọc Private Key của Service Account. Hãy kiểm tra định dạng PEM.");
    }
    
    openssl_sign($signatureInput, $signature, $pkeyId, OPENSSL_ALGO_SHA256);
    openssl_free_key($pkeyId);

    $base64UrlSignature = base64UrlEncode($signature);
    $jwt = $signatureInput . "." . $base64UrlSignature;

    // Gửi yêu cầu POST trao đổi JWT lấy Access Token từ Google
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Lỗi xác thực Google OAuth2: " . $response);
    }

    $result = json_decode($response, true);
    return $result['access_token'];
}

/**
 * Lấy báo cáo lượng truy cập của GA4 trong 7 ngày qua
 */
function fetchGA4TrafficReport($accessToken, $propertyId) {
    $url = "https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport";

    $requestBody = [
        'dateRanges' => [['startDate' => '7daysAgo', 'endDate' => 'today']],
        'dimensions' => [['name' => 'date']],
        'metrics' => [
            ['name' => 'activeUsers'],
            ['name' => 'sessions'],
            ['name' => 'averageSessionDuration']
        ],
        'orderBys' => [['dimension' => ['dimensionName' => 'date']]]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$accessToken}",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Lỗi lấy báo cáo GA4 [HTTP $httpCode]: " . $response);
    }

    return json_decode($response, true);
}

// --- Ví dụ sử dụng hoàn chỉnh ---
// try {
//     // Đọc file json chứa thông tin Service Account
//     $saJson = json_decode(file_get_contents('google-credentials.json'), true);
//     $propertyId = trim(file_get_contents('google-property-id.txt'));
//     
//     // Lấy Access Token
//     $accessToken = getGoogleAccessToken($saJson['client_email'], $saJson['private_key']);
//     
//     // Lấy báo cáo lượng truy cập
//     $report = fetchGA4TrafficReport($accessToken, $propertyId);
//     
//     echo "Báo cáo GA4 thành công!\n";
//     print_r($report['rows']);
//     
// } catch (Exception $e) {
//     echo "Lỗi: " . $e->getMessage() . "\n";
// }
```

---

## IV. Tóm Tắt & Điểm Cần Lưu Ý Khi Tích Hợp PHP

1. **Khả năng Bảo Mật**: Hãy luôn đặt thông tin thẻ tín dụng cấu hình, tệp `google-credentials.json` ở vị trí an toàn bên ngoài thư mục public của Apache hoặc Nginx, hoặc bảo vệ bằng tệp cấu hình `.env` hoặc hằng số PHP.
2. **Xử lý Bất đồng bộ trong PHP**: PHP mặc định chạy đơn luồng và đồng bộ. Khi thực hiện gửi sự kiện Purchase lên Google Analytics ở phần checkout, việc gọi cURL đồng bộ có thể khiến thời gian tải trang phản hồi của khách hàng bị chậm thêm 1-2 giây. Hãy tối ưu bằng cách:
   * Hạ mức Timeout cURL xuống tối đa 2 giây (`CURLOPT_TIMEOUT => 2`).
   * Sử dụng thư viện cURL Multi (`curl_multi_exec`) hoặc đẩy tác vụ gửi tracking vào một hàng đợi chạy ngầm (Message Queue / Background Job).
3. **Cấu Trúc Mảng Trả Về của API**: Khi tích hợp Strapi 5 hoặc Next.js với PHP, luôn chú ý kiểm tra định dạng của dữ liệu JSON, ví dụ Strapi 5 cấu trúc dữ liệu không chứa thuộc tính `.attributes` nữa mà trả trực tiếp trường giá trị tại cấp ngang hàng với `id`.
