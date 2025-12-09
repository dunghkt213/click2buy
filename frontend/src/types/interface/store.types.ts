/**
 * Store Types - Type definitions for Store
 */

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  rating: number;
  totalReviews: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover?: string;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  followers: number;
  joinedDate: string;
  address: string;
  phone: string;
  email: string;
}

