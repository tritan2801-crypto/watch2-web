'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ChevronLeft, Heart, Sparkles, Check, Info } from 'lucide-react';
import { api, getStrapiMediaUrl } from '../../../lib/api';
import { Product } from '../../../lib/types';
import { useCart } from '../../../lib/CartContext';
import posthog from 'posthog-js';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImage, setActiveImage] = useState('');
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  const sizes = ['S', 'M', 'L', 'XL'];

  useEffect(() => {
    if (!slug) return;
    api.getProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data && data.mainImage) {
          setActiveImage(getStrapiMediaUrl(data.mainImage));
        }
        if (data) {
          posthog.capture('product_viewed', {
            product_id: data.id,
            product_name: data.name,
            product_slug: data.slug,
            category: data.category?.name,
            price: data.salePrice ?? data.price,
            has_discount: data.salePrice !== null && data.salePrice !== undefined,
          });
        }
      })
      .catch((err) => console.error('Failed to load product details:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    posthog.capture('product_added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      category: product.category?.name,
      price: product.salePrice ?? product.price,
      quantity,
      size: selectedSize,
    });
    setShowAddedAlert(true);
    setTimeout(() => setShowAddedAlert(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 w-1/4 bg-neutral-200 rounded-md" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded-md" />
            <div className="h-6 w-1/3 bg-neutral-200 rounded-md" />
            <div className="h-20 bg-neutral-200 rounded-2xl" />
            <div className="h-10 w-full bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <span className="text-4xl mb-4 block">😢</span>
        <h2 className="text-xl font-extrabold text-neutral-800 uppercase">Không Tìm Thấy Sản Phẩm</h2>
        <p className="text-xs text-neutral-400 mt-2">Sản phẩm này có thể đã bị ngừng bán hoặc đổi đường dẫn.</p>
        <button
          onClick={() => router.push('/products')}
          className="mt-6 px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-2xs font-extrabold uppercase tracking-widest hover:bg-emerald-500 transition-colors"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? (product.salePrice as number) : product.price;

  // Compile gallery images
  const galleryImages = [
    getStrapiMediaUrl(product.mainImage)
  ];
  if (Array.isArray(product.gallery)) {
    product.gallery.forEach(img => {
      galleryImages.push(getStrapiMediaUrl(img));
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-900 mb-8 transition-colors uppercase"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Main product box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative w-full overflow-hidden rounded-3xl bg-neutral-50 border border-neutral-100 shadow-sm">
            <img
              src={activeImage || '/placeholder-fashion.svg'}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Gallery Carousel Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? 'border-emerald-500 scale-95 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Configurations */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            {product.category && (
              <span className="text-3xs font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-500" />
                <span>{product.category.name}</span>
              </span>
            )}
            <h1 className="text-xl sm:text-3xl font-black text-neutral-950 uppercase tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-medium">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-neutral-50/50 rounded-2xl border border-neutral-100">
            {hasDiscount ? (
              <>
                <span className="text-xl sm:text-2xl font-black text-red-500">
                  {product.salePrice?.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-xs sm:text-sm font-semibold text-neutral-400 line-through">
                  {originalPrice.toLocaleString('vi-VN')} đ
                </span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-black text-neutral-950">
                {originalPrice.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>

          {/* Size Selectors */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-800">
              <span>Chọn Kích Cỡ:</span>
              <span className="text-emerald-500">{selectedSize}</span>
            </div>
            <div className="flex gap-2.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                    selectedSize === size
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                      : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-800">Số Lượng:</span>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Counter */}
              <div className="flex items-center border border-neutral-200 rounded-xl bg-white w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2.5 text-neutral-500 hover:text-neutral-950 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-neutral-950 min-w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2.5 text-neutral-500 hover:text-neutral-950 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stockStatus === 'out_of_stock'}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md ${
                  product.stockStatus === 'out_of_stock'
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-neutral-950 hover:bg-emerald-500 text-white hover:scale-102 active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.stockStatus === 'out_of_stock' ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
              </button>
            </div>
          </div>

          {/* Stock and Policy status indicators */}
          <div className="pt-4 border-t border-neutral-100 space-y-2 text-2xs text-neutral-500 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stockStatus === 'in_stock' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>
                Trạng thái:{' '}
                <strong className={product.stockStatus === 'in_stock' ? 'text-emerald-500' : 'text-red-500'}>
                  {product.stockStatus === 'in_stock' ? 'Còn hàng' : 'Hết hàng'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Giao hàng nhanh toàn quốc từ 2 - 3 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Text section */}
      {product.description && (
        <section className="mt-16 pt-10 border-t border-neutral-100 max-w-3xl">
          <h3 className="text-sm font-bold tracking-widest text-neutral-800 uppercase mb-4 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-500" />
            <span>Mô Tả Sản Phẩm</span>
          </h3>
          <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-4 font-medium whitespace-pre-line">
            {product.description}
          </div>
        </section>
      )}

      {/* Toast Alert popup */}
      {showAddedAlert && (
        <div className="fixed bottom-6 right-6 z-50 px-6 py-4 bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in transition-all">
          <div className="p-1 bg-white/20 rounded-full">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="text-xs uppercase tracking-wide">
            Đã thêm {quantity} {product.name} vào giỏ hàng!
          </div>
        </div>
      )}
    </main>
  );
}
