<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Discount;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with demo data.
     */
    public function run(): void
    {
        // 1. Seed Categories & Parent-Child Relationships
        $mensCategory = Category::create([
            'name' => "Men's Watches",
            'slug' => 'mens-watches',
            'description' => 'Luxury and minimalist watches designed for men.'
        ]);

        $womensCategory = Category::create([
            'name' => "Women's Watches",
            'slug' => 'womens-watches',
            'description' => 'Elegant and minimal watches designed for women.'
        ]);

        $chronoSub = Category::create([
            'name' => 'Chrono Collection',
            'slug' => 'mens-chrono',
            'description' => 'Classic chronograph subcategory',
            'parent_id' => $mensCategory->id
        ]);

        $legacySub = Category::create([
            'name' => 'Legacy Collection',
            'slug' => 'mens-legacy',
            'description' => 'Classic slim legacy watches',
            'parent_id' => $mensCategory->id
        ]);

        $novaSub = Category::create([
            'name' => 'Nova Collection',
            'slug' => 'womens-nova',
            'description' => 'Modern constellation inspired women watches',
            'parent_id' => $womensCategory->id
        ]);

        // 2. Seed Products
        $p1 = Product::create([
            'category_id' => $chronoSub->id,
            'title' => 'Chrono Gold - Matte Black',
            'sku' => 'MC-01-GOLD',
            'description' => 'A bold gold steel casing matched with a custom matte black face and strap.',
            'thumbnail' => 'images/chrono_gold.png',
            'images' => ['images/chrono_gold.png', 'images/chrono_gold_angle.png'],
            'original_price' => 140.00,
            'sale_price' => 125.00,
            'stock_quantity' => 45,
            'status' => 'in_stock'
        ]);

        $p2 = Product::create([
            'category_id' => $novaSub->id,
            'title' => 'Nova Stella - Rose Blush',
            'sku' => 'WN-03-STELLA',
            'description' => 'Elegant rose gold casing with a subtle blush dial. Minimal styling at its best.',
            'thumbnail' => 'images/stella_rose.png',
            'images' => ['images/stella_rose.png'],
            'original_price' => 140.00,
            'sale_price' => null,
            'stock_quantity' => 18,
            'status' => 'in_stock'
        ]);

        $p3 = Product::create([
            'category_id' => $mensCategory->id,
            'title' => 'Voyager Blue - Tan Strap',
            'sku' => 'MV-02-VOY',
            'description' => 'Water resistant dial with blue shading matched with a light brown genuine leather strap.',
            'thumbnail' => 'images/voyager_blue.png',
            'images' => ['images/voyager_blue.png'],
            'original_price' => 122.50,
            'sale_price' => 110.00,
            'stock_quantity' => 5,
            'status' => 'in_stock'
        ]);

        $p4 = Product::create([
            'category_id' => $legacySub->id,
            'title' => 'Legacy Slim - Mesh Band',
            'sku' => 'ML-04-LEGCY',
            'description' => 'Ultra slim profile watch with a gunmetal steel mesh link band.',
            'thumbnail' => 'images/legacy_slim.png',
            'images' => ['images/legacy_slim.png'],
            'original_price' => 165.00,
            'sale_price' => null,
            'stock_quantity' => 0,
            'status' => 'out_of_stock'
        ]);

        // 3. Seed Direct Markdown Discounts & Pivot table mapping
        $promoDiscount = Discount::create([
            'name' => 'Spring Markdown Campaign',
            'discount_type' => 'fixed',
            'value' => 15.00,
            'start_date' => Carbon::now()->subDays(2),
            'end_date' => Carbon::now()->addDays(15),
        ]);

        $p1->discounts()->attach($promoDiscount->id);
        $p3->discounts()->attach($promoDiscount->id);

        // 4. Seed Promo Code Coupons
        Coupon::create([
            'code' => 'WELCOME10',
            'discount_type' => 'percentage',
            'value' => 10.00,
            'min_order_value' => 50.00,
            'usage_limit' => 200,
            'used_count' => 12,
            'expires_at' => Carbon::now()->addDays(30)
        ]);

        Coupon::create([
            'code' => 'SUMMER20',
            'discount_type' => 'percentage',
            'value' => 20.00,
            'min_order_value' => 100.00,
            'usage_limit' => 50,
            'used_count' => 0,
            'expires_at' => Carbon::now()->addDays(10)
        ]);

        // 5. Seed Orders (Testing Status Flows)
        
        // Order 1: Pending & Unpaid (Bank Transfer awaiting confirmation)
        $o1 = Order::create([
            'order_number' => 'MVMT-1001',
            'customer_name' => 'Nguyễn Văn Hải',
            'customer_phone' => '0912345678',
            'province_code' => '79', // HCMC
            'district_code' => '760', // District 1
            'ward_code' => '26734', // Ben Nghe Ward
            'detailed_address' => '12 Lê Lợi, P. Bến Nghé',
            'subtotal' => 262.50,
            'discount_amount' => 26.25,
            'shipping_fee' => 0.00,
            'total_amount' => 236.25,
            'order_status' => 'pending',
            'payment_status' => 'pending_payment',
            'payment_method' => 'Bank_Transfer'
        ]);

        OrderItem::create([
            'order_id' => $o1->id,
            'product_id' => $p1->id,
            'quantity' => 1,
            'price' => 140.00
        ]);

        OrderItem::create([
            'order_id' => $o1->id,
            'product_id' => $p3->id,
            'quantity' => 1,
            'price' => 122.50
        ]);

        // Order 2: Confirmed & Paid (E-Wallet MoMo paid)
        $o2 = Order::create([
            'order_number' => 'MVMT-1002',
            'customer_name' => 'Trần Thị Thu Trang',
            'customer_phone' => '0987654321',
            'province_code' => '01', // Hanoi
            'district_code' => '001', // Hoan Kiem
            'ward_code' => '00001', // Hang Dao
            'detailed_address' => '45 Hàng Đào',
            'subtotal' => 280.00,
            'discount_amount' => 0.00,
            'shipping_fee' => 15.00,
            'total_amount' => 295.00,
            'order_status' => 'confirmed',
            'payment_status' => 'paid',
            'payment_method' => 'Wallet'
        ]);

        OrderItem::create([
            'order_id' => $o2->id,
            'product_id' => $p2->id,
            'quantity' => 2,
            'price' => 140.00
        ]);

        // Order 3: Delivered & Paid (COD order finished)
        $o3 = Order::create([
            'order_number' => 'MVMT-1003',
            'customer_name' => 'Lê Hoàng Long',
            'customer_phone' => '0905556677',
            'province_code' => '48', // Da Nang
            'district_code' => '490', // Hai Chau
            'ward_code' => '20194', // Thach Thang
            'detailed_address' => '88 Quang Trung',
            'subtotal' => 165.00,
            'discount_amount' => 16.50,
            'shipping_fee' => 0.00,
            'total_amount' => 148.50,
            'order_status' => 'delivered',
            'payment_status' => 'paid',
            'payment_method' => 'COD'
        ]);

        OrderItem::create([
            'order_id' => $o3->id,
            'product_id' => $p4->id,
            'quantity' => 1,
            'price' => 165.00
        ]);
    }
}
