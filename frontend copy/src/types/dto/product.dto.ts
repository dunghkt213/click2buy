/**
 * Product DTOs - Data Transfer Objects for Products
 */

// ============================================
// Request DTOs
// ============================================

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  brand: string;
  condition?: 'new' | 'used';
  categoryIds?: string[];
  tags?: string[];
  images?: string[];
  attributes?: Record<string, any>;
  variants?: Record<string, any>;
  warehouseAddress?: WarehouseAddressDto;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  originalPrice?: number;
  stock?: number;
  category?: string;
  categoryIds?: string[];
  images?: string[];
  brand?: string;
  specifications?: Record<string, string>;
  attributes?: Record<string, any>;
  variants?: Record<string, any>;
  isActive?: boolean;
}

export interface ProductQueryDto {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  keyword?: string;
  rating?: number;
  brands?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SellerProductQueryDto {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: string;
}

export interface WarehouseAddressDto {
  line1: string;
  line2?: string;
  city: string;
  province?: string;
  country?: string;
  postalCode?: string;
}

// ============================================
// Response DTOs
// ============================================

export interface DeleteProductResponseDto {
  success: boolean;
  message: string;
}

// ============================================
// Backend DTOs
// ============================================

export interface BackendProductDto {
  _id?: string;
  id?: string;
  name: string;
  ownerId?: string;
  sellerId?: string;
  description?: string;
  price: number;
  salePrice?: number;
  sale_price?: number;
  stock?: number;
  brand?: string;
  condition?: 'new' | 'used';
  categoryIds?: string[];
  tags?: string[];
  images?: string[];
  image?: string;
  attributes?: Record<string, any>;
  variants?: Record<string, any>;
  warehouseAddress?: WarehouseAddressDto;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DELETED';
  rating?: number;
  ratingAvg?: number;
  reviews?: number;
  soldCount?: number;
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  timeLeft?: string;
  specifications?: Record<string, string>;
  discount?: number;
  category?: string;
  inStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

