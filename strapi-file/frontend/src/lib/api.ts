import { Category, Product, Banner, SiteSetting, CheckoutRequest, CheckoutResponse, StrapiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Resolves the full URL for a Strapi media asset
 */
export function getStrapiMediaUrl(media?: { url: string } | null, fallback = '/placeholder-fashion.svg'): string {
  if (!media || !media.url) {
    return fallback;
  }
  if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
    return media.url;
  }
  return `${API_URL}${media.url}`;
}

/**
 * Helper to fetch with error handling
 */
async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!res.ok) {
      let errorDetail = 'Unknown API error';
      try {
        const errJson = await res.json();
        errorDetail = errJson?.error?.message || JSON.stringify(errJson);
      } catch {
        errorDetail = res.statusText;
      }
      throw new Error(`HTTP ${res.status}: ${errorDetail}`);
    }

    return await res.json() as T;
  } catch (error) {
    console.error(`Error fetching API from ${url}:`, error);
    throw error;
  }
}

export const api = {
  /**
   * Fetch all active categories
   */
  async getCategories(): Promise<Category[]> {
    const res = await fetchAPI<StrapiResponse<Category[]>>('/api/categories?populate=*&filters[isActive][$eq]=true');
    return res.data;
  },

  /**
   * Fetch active products with optional filters
   */
  async getProducts(filters?: { categorySlug?: string; isFeatured?: boolean; search?: string }): Promise<Product[]> {
    let query = '/api/products?populate=*&filters[isActive][$eq]=true';
    
    if (filters?.categorySlug) {
      query += `&filters[category][slug][$eq]=${filters.categorySlug}`;
    }
    
    if (filters?.isFeatured !== undefined) {
      query += `&filters[isFeatured][$eq]=${filters.isFeatured}`;
    }
    
    if (filters?.search) {
      query += `&filters[$or][0][name][$contains]=${filters.search}&filters[$or][1][shortDescription][$contains]=${filters.search}`;
    }

    const res = await fetchAPI<StrapiResponse<Product[]>>(query);
    return res.data;
  },

  /**
   * Fetch a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const query = `/api/products?populate=*&filters[slug][$eq]=${slug}&filters[isActive][$eq]=true`;
    const res = await fetchAPI<StrapiResponse<Product[]>>(query);
    return res.data.length > 0 ? res.data[0] : null;
  },

  /**
   * Fetch active home banners
   */
  async getBanners(): Promise<Banner[]> {
    const res = await fetchAPI<StrapiResponse<Banner[]>>('/api/banners?populate=*&filters[isActive][$eq]=true');
    return res.data;
  },

  /**
   * Fetch global site settings
   */
  async getSiteSetting(): Promise<SiteSetting | null> {
    try {
      const res = await fetchAPI<StrapiResponse<SiteSetting>>('/api/site-setting?populate=*');
      return res.data;
    } catch (e) {
      console.warn('Failed to fetch site setting, returning fallback structure', e);
      return {
        id: 0,
        documentId: 'fallback',
        siteName: 'AURA Studio',
        hotline: '090.123.4567',
        zalo: '0901234567',
        facebook: 'https://facebook.com/aurastudio',
        address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        seoTitle: 'AURA Studio - Thời Trang Phong Cách Sống Tối Giản',
        seoDescription: 'Cung cấp các sản phẩm thiết kế basic chất lượng cao.'
      };
    }
  },

  /**
   * Submit secure customer checkout order
   */
  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return await fetchAPI<CheckoutResponse>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
