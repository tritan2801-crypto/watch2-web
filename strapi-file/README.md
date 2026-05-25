# AURA Studio - E-Commerce Fashion Shop
### Strapi 5 + PostgreSQL (Dockerized) & Next.js 15 App Router + Tailwind CSS

Dự án này là một ứng dụng thương mại điện tử (E-Commerce) hoàn chỉnh, bảo mật cao và có thiết kế vô cùng tinh tế, phù hợp cho các thương hiệu thời trang tối giản và phong cách sống hiện đại. Hệ thống bao gồm một backend Strapi 5 headless CMS chạy trên môi trường container Docker cùng cơ sở dữ liệu PostgreSQL độc lập, và một frontend Next.js 15 App Router tốc độ cao.

---

## 🛠️ Kiến Trúc Hệ Thống (Architecture)

```txt
                       [ Trình Duyệt Người Dùng ]
                                   │
                         (Port 3000 / Next.js)
                                   ▼
             ┌───────────────────────────────────────────┐
             │       Next.js 15 App Router Storefront    │
             │     (Tailwind CSS v4 & Client State)      │
             └─────────────────────┬─────────────────────┘
                                   │
                        (REST API / Port 1337)
                                   ▼
             ┌───────────────────────────────────────────┐
             │       Strapi 5 Headless CMS (Docker)      │
             │    - Custom API /api/checkout (COD)       │
             │    - Local DB & Looker Analytics Panel    │
             └─────────────────────┬─────────────────────┘
                                   │
                          (Postgres Port 5432)
                                   ▼
             ┌───────────────────────────────────────────┐
             │        PostgreSQL 16 Database DB          │
             └───────────────────────────────────────────┘
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Hệ thống được thiết kế với cơ chế **Zero-Configuration (Không cần cấu hình ban đầu)**. Khi chạy Docker Compose, hệ thống sẽ tự khởi tạo database, tự động Seed dữ liệu mẫu (sản phẩm, danh mục, banner, site settings) và tự động cấp quyền API công khai.

### Bước 1: Khởi động Docker Container (PostgreSQL & Strapi)
Đảm bảo bạn đã mở Docker Desktop, sau đó chạy lệnh sau ở thư mục gốc của dự án:
```bash
docker compose up -d --build
```
Lệnh này sẽ tải các image cần thiết, build và chạy:
- Container cơ sở dữ liệu PostgreSQL (`shop-postgres-dev`) trên cổng `5432`.
- Container backend Strapi 5 (`shop-strapi-dev`) trên cổng `1337`.
- Tự động Seeder chạy khi khởi tạo: tạo sẵn danh mục, sản phẩm thời trang mẫu, cài đặt website và cấp quyền gọi API cho khách.

### Bước 2: Biên dịch Trang Quản Trị Custom Analytics
Sau khi Strapi khởi động xong lần đầu, bạn cần chạy biên dịch (build) lại giao diện admin panel của Strapi để tích hợp trang thống kê biểu đồ Google Analytics mới:
```bash
docker exec shop-strapi-dev npx strapi build
```
Bây giờ, bạn có thể truy cập trang quản trị tại: `http://localhost:1337/admin`

### Bước 3: Cài đặt và Khởi chạy Frontend Next.js
Mở một cửa sổ terminal mới ở thư mục dự án, di chuyển vào thư mục frontend, cài đặt dependencies và khởi chạy dev server:
```bash
cd frontend
npm install
npm run dev
```
Trang mua sắm Next.js sẽ hoạt động tại: `http://localhost:3000`

---

## 📊 Tích Hợp Google Analytics Center inside Strapi

Để tối ưu hóa trải nghiệm quản lý cửa hàng ngay tại môi trường phát triển local, chúng tôi thiết kế trang quản trị **Google Analytics** độc quyền ngay tại thanh điều hướng bên trái của Strapi Admin (`http://localhost:1337/admin`):

1. **📊 Phân Hệ 1: Thống Kê Cửa Hàng (Local DB Dashboard):**
   - Đọc trực tiếp dữ liệu từ PostgreSQL local để vẽ biểu đồ doanh số bằng **SVG động** cực xịn.
   - Thống kê: Tổng Doanh Thu (VND), số đơn hàng, giá trị đơn trung bình (AOV), tỉ lệ chuyển đổi.
   - Biểu đồ xếp hạng **Top Sản Phẩm Bán Chạy** trực quan.
   - Bảng **Đơn Hàng Gần Đây** để quản lý trạng thái đơn hàng COD thực tế.

2. **📈 Phân Hệ 2: Nhúng Google Looker Studio (GA4 Live Chart):**
   - Kết nối trực tiếp GA4 và nhúng nguyên vẹn biểu đồ tương tác của Google vào Admin bằng link Looker Studio được lưu trong `localStorage`.

3. **🛠️ Phân Hệ 3: GA4 Quick Links & Connection Guide:**
   - Hướng dẫn nhanh cách thiết lập GA4 Looker trong 1 phút.
   - Phím tắt điều hướng nhanh đến báo cáo Realtime, Page Views, Ecommerce trên Google Analytics.

---

## 🔒 Các Tính Năng Bảo Mật & Tối Ưu E-Commerce

1. **Kiểm Tra Giá Phía Máy Chủ (Server-Side Price Verification):**
   - Quyền gửi trực tiếp đơn hàng lên `/api/orders` bị chặn hoàn toàn đối với Public Role để tránh khách hàng tự thay đổi giá trị đơn hàng.
   - Khách bắt buộc phải gửi đơn qua custom endpoint `/api/checkout`. Controller này sẽ kiểm tra sản phẩm từ database, lấy đúng giá niêm yết/sale thực tế để tính toán tổng tiền, và lưu trữ đơn hàng an toàn.
2. **GA4 Backend Tracking (COD Purchase Events):**
   - Khi đặt hàng thành công qua `/api/checkout`, hệ thống sẽ gọi ngầm API **GA4 Measurement Protocol** bằng `GA_MEASUREMENT_ID` (`G-98DRW31N5G`) và `GA_API_SECRET` (`IoUh4HcwTgWzuuVuJgfxjg`) để báo cáo sự kiện mua hàng về Google Analytics.
3. **Phần Quyền Tự Động (Auto-Permission Bootstrapping):**
   - File seeder `backend/src/index.ts` tự động gán quyền truy vấn danh mục, sản phẩm, banner cho vai trò khách vãng lai khi khởi chạy, loại bỏ việc thao tác thủ công trên trang quản trị.