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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('categories')
                  ->onDelete('set null');
            $table->string('title');
            $table->string('sku')->unique();
            $table->longText('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('images')->nullable(); // Image gallery JSON array
            $table->decimal('original_price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->enum('status', ['draft', 'in_stock', 'out_of_stock'])->default('draft');
            $table->timestamps();
            $table->softDeletes(); // Enable SoftDeletes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
