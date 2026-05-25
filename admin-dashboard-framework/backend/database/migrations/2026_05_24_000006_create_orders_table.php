<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Customer Details
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('province_code');
            $table->string('district_code');
            $table->string('ward_code');
            $table->string('detailed_address');
            
            // Financial Status & Breakdown
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('shipping_fee', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2);
            
            // Exact status flows
            $table->enum('order_status', ['pending', 'confirmed', 'delivered'])->default('pending');
            $table->enum('payment_status', ['pending_payment', 'paid'])->default('pending_payment');
            
            $table->string('payment_method'); // COD, Bank_Transfer, Wallet, etc.
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
