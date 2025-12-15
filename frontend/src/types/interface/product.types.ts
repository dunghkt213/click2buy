/**
 * Product Types - Type definitions for Products
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  brand: string;
  inStock: boolean;
  stock?: number; // Số lượng còn lại trong kho
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  soldCount?: number;
  timeLeft?: string;
  images?: string[];
  specifications?: Record<string, string>;
  ownerId?: string;
  sellerId?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  rating: number;
  reviews: number;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  brands: string[];
  rating: number;
  inStock: boolean;
}

