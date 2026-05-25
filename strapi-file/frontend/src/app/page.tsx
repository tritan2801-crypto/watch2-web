'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { api, getStrapiMediaUrl } from '../lib/api';
import { Banner, Category, Product } from '../lib/types';
import posthog from 'posthog-js';

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [banData, catData, prodData] = await Promise.all([
          api.getBanners().catch(() => []),
          api.getCategories().catch(() => []),
          api.getProducts({ isFeatured: true }).catch(() => []),
        ]);
        setBanners(banData);
        setCategories(catData);
        setFeaturedProducts(prodData);
      } catch (err) {
        console.error('Failed to load page datasets:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Banner slide auto play
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-100 h-64 sm:h-96 md:h-120 bg-neutral-200 rounded-3xl" />
        
        {/* Categories Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-48 bg-neutral-200 rounded-md" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-neutral-200 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-48 bg-neutral-200 rounded-md" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-neutral-200 rounded-2xl" />
                <div className="h-4 w-3/4 bg-neutral-200 rounded-md" />
                <div className="h-4 w-1/4 bg-neutral-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-16 pb-24">
      {/* 1. Hero Banners Slider */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden group max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="relative h-64 sm:h-96 md:h-120 w-full rounded-3xl overflow-hidden bg-neutral-100 shadow-lg border border-neutral-100">
            {banners.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Visual Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-900/50 to-transparent z-10" />
                <img
                  src={getStrapiMediaUrl(slide.image, '/placeholder-fashion.svg')}
                  alt={slide.title || 'Banner Image'}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Content Overlay */}
                <div className="relative z-20 max-w-2xl px-6 sm:px-12 md:px-20 text-white space-y-4">
                  {slide.subtitle && (
                    <p className="text-2xs sm:text-xs font-bold tracking-widest text-emerald-400 uppercase">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.title && (
                    <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                  )}
                  {slide.link && (
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-neutral-950 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-emerald-400 hover:text-white transition-all transform hover:scale-105"
                    >
                      <span>Mua Sắm Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Slider Navigation arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 hover:bg-white text-white hover:text-neutral-950 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 hover:bg-white text-white hover:text-neutral-950 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </section>
      ) : (
        /* Fallback Default Elegant Slide */
        <section className="relative overflow-hidden max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="relative h-64 sm:h-96 md:h-110 w-full rounded-3xl overflow-hidden bg-neutral-950 flex items-center shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/60 to-transparent z-10" />
            <div className="absolute inset-0 w-full h-full opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
            
            <div className="relative z-20 max-w-2xl px-6 sm:px-12 md:px-20 text-white space-y-4">
              <span className="text-2xs sm:text-xs font-bold tracking-widest text-emerald-400 uppercase">
                Bộ Sưu Tập Mùa Hè 2026
              </span>
              <h2 className="text-xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                PHONG CÁCH TỐI GIẢN <br /> NÂNG TẦM BẢN THÂN
              </h2>
              <p className="text-2xs sm:text-sm text-neutral-300 font-medium max-w-md">
                Khám phá các thiết kế tinh giản, sử dụng 100% chất liệu Cotton hữu cơ và Linen thoáng mát tự nhiên.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all transform hover:scale-105"
              >
                <span>Xem Sản Phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. Shop by Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight uppercase text-neutral-950">Danh mục nổi bật</h3>
              <p className="text-xs text-neutral-500 mt-1">Lựa chọn trang phục theo phong cách của riêng bạn</p>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-emerald-500 flex items-center gap-1 transition-colors"
            >
              <span>Xem Tất Cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative h-28 sm:h-36 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 flex items-end p-4 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent z-10" />
                <img
                  src={getStrapiMediaUrl(category.image, '/placeholder-fashion.svg')}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="relative z-20 text-white">
                  <h4 className="text-sm sm:text-base font-extrabold tracking-wide uppercase">{category.name}</h4>
                  <p className="text-3xs sm:text-2xs text-neutral-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    Khám phá ngay →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-2xs sm:text-xs font-bold tracking-widest text-emerald-500 uppercase flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>Sản Phẩm Đầy Cảm Hứng</span>
          </span>
          <h3 className="text-xl sm:text-3xl font-black tracking-tight uppercase text-neutral-950 mt-1">
            Gợi Ý Cho Bạn
          </h3>
          <p className="text-xs text-neutral-500 mt-1.5">
            Những thiết kế tinh tế đang dẫn đầu xu hướng thời trang tối giản trong mùa này
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featuredProducts.map((product) => {
              const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
              return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Badge details */}
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 z-20 px-2 py-1 bg-red-500 text-white text-3xs font-extrabold rounded-md uppercase tracking-wider">
                      Khuyến Mãi
                    </span>
                  )}

                  {/* Thumbnail */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="aspect-square relative w-full overflow-hidden bg-neutral-50"
                    onClick={() => posthog.capture('featured_product_clicked', {
                      product_id: product.id,
                      product_name: product.name,
                      product_slug: product.slug,
                      category: product.category?.name,
                      price: product.salePrice ?? product.price,
                    })}
                  >
                    <img
                      src={getStrapiMediaUrl(product.mainImage, '/placeholder-fashion.svg')}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Info details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {product.category && (
                        <span className="text-3xs font-bold text-emerald-500 uppercase tracking-widest">
                          {product.category.name}
                        </span>
                      )}
                      <h4 className="text-xs sm:text-sm font-extrabold text-neutral-950 group-hover:text-emerald-500 transition-colors uppercase truncate mt-0.5">
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => posthog.capture('featured_product_clicked', {
                            product_id: product.id,
                            product_name: product.name,
                            product_slug: product.slug,
                            category: product.category?.name,
                            price: product.salePrice ?? product.price,
                          })}
                        >{product.name}</Link>
                      </h4>
                      <p className="text-3xs sm:text-2xs text-neutral-500 leading-relaxed truncate mt-1">
                        {product.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2 pt-1 border-t border-neutral-50">
                      {hasDiscount ? (
                        <>
                          <span className="text-xs sm:text-sm font-extrabold text-neutral-950">
                            {product.salePrice?.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-3xs sm:text-2xs font-semibold text-neutral-400 line-through">
                            {product.price.toLocaleString('vi-VN')}đ
                          </span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm font-extrabold text-neutral-950">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
            <p className="text-sm font-semibold text-neutral-400">Đang cập nhật các sản phẩm tiêu biểu...</p>
          </div>
        )}
      </section>
    </main>
  );
}
