'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, RefreshCw, X, ShoppingBag } from 'lucide-react';
import { api, getStrapiMediaUrl } from '../../lib/api';
import { Product, Category } from '../../lib/types';
import posthog from 'posthog-js';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  
  const activeCategory = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  // Synchronize inputs on url changes
  useEffect(() => {
    setSearchVal(searchParam);
  }, [searchParam]);

  // Fetch initial categories and products based on URL params
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [catData, prodData] = await Promise.all([
          api.getCategories().catch(() => []),
          api.getProducts({
            categorySlug: activeCategory || undefined,
            search: searchParam || undefined
          }).catch(() => [])
        ]);
        setCategories(catData);
        setProducts(prodData);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, [activeCategory, searchParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      params.set('search', searchVal.trim());
      posthog.capture('product_search_submitted', { query: searchVal.trim() });
    } else {
      params.delete('search');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
      posthog.capture('category_filter_applied', { category_slug: slug });
    } else {
      params.delete('category');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    posthog.capture('filters_cleared', {
      previous_category: activeCategory || null,
      previous_search: searchParam || null,
    });
    setSearchVal('');
    router.push('/products');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      {/* Header title */}
      <div>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">Bộ sưu tập thời trang</h1>
        <p className="text-xs text-neutral-500 mt-1">Các thiết kế tinh tế, tôn dáng và mang hơi thở hiện đại</p>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Sidebar Filter Panel */}
        <div className="lg:col-span-1 bg-neutral-50/50 border border-neutral-100 rounded-3xl p-6 space-y-6">
          {/* Search box */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold tracking-widest text-neutral-800 uppercase flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <span>Tìm Kiếm</span>
            </h4>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-emerald-500 transition-colors"
                aria-label="Search Submit"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Categories select list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-neutral-800 uppercase flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              <span>Danh Mục</span>
            </h4>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-3.5 py-2 rounded-xl text-2xs font-bold uppercase tracking-wider text-left transition-all ${
                  activeCategory === ''
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-100'
                }`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-3.5 py-2 rounded-xl text-2xs font-bold uppercase tracking-wider text-left transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters button */}
          {(activeCategory || searchParam) && (
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 bg-neutral-100 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded-xl text-2xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors border border-neutral-100"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Right Side: Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-neutral-200 rounded-2xl" />
                  <div className="h-4 w-3/4 bg-neutral-200 rounded-md" />
                  <div className="h-4 w-1/4 bg-neutral-200 rounded-md" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const hasDiscount = product.salePrice !== null && product.salePrice !== undefined;
                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl border border-neutral-100 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-red-500 text-white text-3xs font-extrabold rounded-md uppercase tracking-wider">
                        Khuyến Mãi
                      </span>
                    )}

                    <Link href={`/products/${product.slug}`} className="aspect-square relative w-full overflow-hidden bg-neutral-50">
                      <img
                        src={getStrapiMediaUrl(product.mainImage, '/placeholder-fashion.svg')}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {product.category && (
                          <span className="text-3xs font-bold text-emerald-500 uppercase tracking-widest">
                            {product.category.name}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-950 group-hover:text-emerald-500 transition-colors uppercase truncate mt-0.5">
                          <Link href={`/products/${product.slug}`}>{product.name}</Link>
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
            <div className="text-center py-24 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-sm font-semibold text-neutral-500">Không tìm thấy sản phẩm phù hợp.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-2xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors"
              >
                Xóa tìm kiếm
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
        <p className="text-xs text-neutral-400 mt-2 font-semibold">Đang tải cửa hàng...</p>
      </div>
    }>
      <ProductsCatalogContent />
    </Suspense>
  );
}
