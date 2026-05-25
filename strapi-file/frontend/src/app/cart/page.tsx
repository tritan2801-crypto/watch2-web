'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../lib/CartContext';
import { getStrapiMediaUrl } from '../../lib/api';
import posthog from 'posthog-js';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <span className="text-5xl block animate-bounce">🛒</span>
        <h1 className="text-xl sm:text-2xl font-black uppercase text-neutral-800">Giỏ Hàng Của Bạn Trống</h1>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto font-semibold">
          Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy lướt qua bộ sưu tập của chúng tôi để chọn sản phẩm ưng ý nhất!
        </p>
        <button
          onClick={() => router.push('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-950 text-white rounded-xl text-2xs font-extrabold uppercase tracking-widest hover:bg-emerald-500 transition-all transform hover:scale-105"
        >
          <span>Mua Sắm Ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">Giỏ hàng của bạn</h1>
        <p className="text-xs text-neutral-500 mt-1">Đang có {cartCount} sản phẩm trong giỏ hàng</p>
      </div>

      {/* Cart Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const product = item.product;
            const price = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.price;
            
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-white border border-neutral-100 rounded-2xl shadow-2xs hover:shadow-xs transition-all"
              >
                {/* Image */}
                <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0">
                  <img src={getStrapiMediaUrl(product.mainImage)} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-3xs font-extrabold text-emerald-500 uppercase tracking-widest block">
                    {product.category?.name || 'Sản phẩm'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate uppercase">
                    <Link href={`/products/${product.slug}`} className="hover:text-emerald-500 transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  <span className="text-2xs sm:text-xs font-bold text-neutral-950 block">
                    {price.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {/* Adjust Quantities */}
                <div className="flex items-center border border-neutral-200 rounded-xl bg-white flex-shrink-0">
                  <button
                    onClick={() => {
                      updateQuantity(product.id, item.quantity - 1);
                      if (item.quantity - 1 > 0) {
                        posthog.capture('cart_item_quantity_updated', {
                          product_id: product.id,
                          product_name: product.name,
                          new_quantity: item.quantity - 1,
                        });
                      }
                    }}
                    className="p-2 text-neutral-500 hover:text-neutral-900"
                    aria-label="Decrease Quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-2xs font-extrabold text-neutral-950 min-w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      updateQuantity(product.id, item.quantity + 1);
                      posthog.capture('cart_item_quantity_updated', {
                        product_id: product.id,
                        product_name: product.name,
                        new_quantity: item.quantity + 1,
                      });
                    }}
                    className="p-2 text-neutral-500 hover:text-neutral-900"
                    aria-label="Increase Quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove item */}
                <button
                  onClick={() => {
                    posthog.capture('cart_item_removed', {
                      product_id: product.id,
                      product_name: product.name,
                      quantity: item.quantity,
                    });
                    removeFromCart(product.id);
                  }}
                  className="p-2.5 bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl border border-neutral-100 transition-colors flex-shrink-0"
                  aria-label="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="lg:col-span-1 bg-neutral-50 border border-neutral-100 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-bold tracking-widest text-neutral-800 uppercase pb-3 border-b border-neutral-200">
            Tóm tắt đơn hàng
          </h3>

          <div className="space-y-4 text-xs font-semibold text-neutral-600">
            <div className="flex justify-between">
              <span>Tạm tính ({cartCount} món)</span>
              <span className="text-neutral-850 font-bold">{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">Miễn Phí</span>
            </div>
            
            <div className="border-t border-neutral-200 pt-4 flex justify-between text-neutral-950 font-black text-sm uppercase">
              <span>Tổng thanh toán</span>
              <span className="text-lg font-black text-emerald-500">{cartTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <button
            onClick={() => {
              posthog.capture('checkout_initiated', {
                cart_total: cartTotal,
                item_count: cartCount,
              });
              router.push('/checkout');
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-950 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all hover:scale-102 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Tiến hành đặt hàng</span>
          </button>
        </div>
      </div>
    </main>
  );
}