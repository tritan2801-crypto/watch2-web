<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_name',
        'customer_phone',
        'province_code',
        'district_code',
        'ward_code',
        'detailed_address',
        'subtotal',
        'discount_amount',
        'shipping_fee',
        'total_amount',
        'order_status',
        'payment_status',
        'payment_method',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the order items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the user who placed the order (if registered).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Paid orders.
     */
    public function scopePaid(Builder $query): Builder
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope: Pending orders.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('order_status', 'pending');
    }

    /**
     * Scope: Confirmed orders.
     */
    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->where('order_status', 'confirmed');
    }

    /**
     * Scope: Delivered orders.
     */
    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('order_status', 'delivered');
    }

    // --- Optimized Analytics Queries for Dashboard Panel ---

    /**
     * 1. Calculate Total Revenue (Sum of total_amount from paid orders)
     */
    public static function calculateTotalPaidRevenue(): float
    {
        return (float) self::where('payment_status', 'paid')->sum('total_amount');
    }

    /**
     * 2. Order Grouping (Count of orders grouped by order_status)
     * Useful for status counts on order dashboard indicators.
     */
    public static function getOrderCountSummaryByStatus(): array
    {
        $summaries = self::select('order_status', DB::raw('count(*) as count'))
                         ->groupBy('order_status')
                         ->get()
                         ->pluck('count', 'order_status')
                         ->toArray();

        // Ensure default structures are set
        return array_merge([
            'pending' => 0,
            'confirmed' => 0,
            'delivered' => 0
        ], $summaries);
    }

    /**
     * 3. Top Selling Products
     * Aggregates quantity from order_items joined with products, ordered by sales descending.
     */
    public static function getTopSellingProducts(int $limit = 5)
    {
        return OrderItem::join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.title',
                'products.sku',
                DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.title', 'products.sku')
            ->orderByDesc('total_quantity_sold')
            ->limit($limit)
            ->get();
    }
}
