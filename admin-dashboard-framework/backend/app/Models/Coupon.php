<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_type',
        'value',
        'min_order_value',
        'usage_limit',
        'used_count',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'usage_limit' => 'integer',
        'used_count' => 'integer',
        'expires_at' => 'datetime',
    ];

    /**
     * Check if the coupon is expired.
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        return Carbon::now()->greaterThan($this->expires_at);
    }

    /**
     * Check if the coupon has hit its usage limit.
     */
    public function isLimitReached(): bool
    {
        if (!$this->usage_limit) {
            return false;
        }
        return $this->used_count >= $this->usage_limit;
    }

    /**
     * Check if the coupon is currently valid for a specific cart total.
     */
    public function isValidForAmount(float $amount): bool
    {
        if ($this->isExpired() || $this->isLimitReached()) {
            return false;
        }
        return $amount >= $this->min_order_value;
    }

    /**
     * Calculate the discount amount.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if (!$this->isValidForAmount($subtotal)) {
            return 0.00;
        }

        if ($this->discount_type === 'percentage') {
            return round(($subtotal * ($this->value / 100)), 2);
        }

        return min($this->value, $subtotal);
    }
}
