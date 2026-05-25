<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'title',
        'sku',
        'description',
        'thumbnail',
        'images',
        'original_price',
        'sale_price',
        'stock_quantity',
        'status',
    ];

    protected $casts = [
        'images' => 'array', // Gallery images array cast
        'original_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the direct discount campaigns applied to this product.
     */
    public function discounts(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class);
    }

    /**
     * Get the order items associated with this product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Check if the product has an active discount campaign.
     */
    public function activeDiscount()
    {
        return $this->discounts()
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now())
                    ->first();
    }
}
