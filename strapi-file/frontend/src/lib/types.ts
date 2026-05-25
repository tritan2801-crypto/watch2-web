export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
  mime: string;
}

export interface StrapiMedia {
  id: number;
  documentId?: string;
  name: string;
  url: string;
  alternativeText?: string;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  image?: StrapiMedia;
  isActive: boolean;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  mainImage?: StrapiMedia;
  gallery?: StrapiMedia[];
  isFeatured: boolean;
  isActive: boolean;
  stockStatus: 'in_stock' | 'out_of_stock' | 'preorder';
  category?: Category;
}

export interface Banner {
  id: number;
  documentId: string;
  title?: string;
  subtitle?: string;
  image?: StrapiMedia;
  link?: string;
  isActive: boolean;
}

export interface SiteSetting {
  id: number;
  documentId: string;
  siteName?: string;
  logo?: StrapiMedia;
  hotline?: string;
  zalo?: string;
  facebook?: string;
  address?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutRequest {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface CheckoutResponse {
  success: boolean;
  order: {
    id: number;
    documentId: string;
    customerName: string;
    phone: string;
    address: string;
    note?: string;
    totalAmount: number;
    status: string;
    items: {
      productId: number;
      name: string;
      slug: string;
      quantity: number;
      unitPrice: number;
    }[];
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}