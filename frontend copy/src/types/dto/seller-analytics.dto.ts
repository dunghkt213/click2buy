/**
 * Seller Analytics DTOs - Data Transfer Objects for Seller Analytics
 */

// ============================================
// Request DTOs
// ============================================

export interface SellerOrderQueryDto {
  status?: string;
  page?: number;
  limit?: number;
}

export interface RevenueQueryDto {
  type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

// ============================================
// Response DTOs
// ============================================

export interface SellerOrderDto {
  id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface RevenueDataDto {
  total: number;
  period: string;
  orders: number;
  growth?: number;
}

export interface ConfirmOrderResponseDto {
  success: boolean;
  message: string;
}

export interface RejectOrderResponseDto {
  success: boolean;
  message: string;
}

