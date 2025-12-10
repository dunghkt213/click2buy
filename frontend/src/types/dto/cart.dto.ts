/**
 * Cart DTOs - Data Transfer Objects for Cart
 */

// ============================================
// Request DTOs
// ============================================

export interface AddToCartDto {
  productId: string;
  quantity: number;
  price: number;
  sellerId: string;
}

export interface UpdateCartItemDto {
  sellerId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface UpdateCartQuantityDto {
  sellerId: string;
  productId: string;
  quantity: number;
}

export interface RemoveCartItemDto {
  sellerId: string;
  productId: string;
}

export interface CreateOrderFromCartDto {
  items: Array<{
    sellerId: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

// ============================================
// Response DTOs
// ============================================

export interface CartResponseDto {
  sellerId: string;
  items: CartItemDto[];
  total: number;
}

export interface CartItemDto {
  productId: string;
  quantity: number;
  price: number;
  product?: any;
}

export interface RemoveCartItemResponseDto {
  success: boolean;
  message: string;
}

// ============================================
// Backend DTOs
// ============================================

export interface BackendCartDto {
  _id?: string;
  id?: string;
  userId?: string;
  sellerId?: string;
  items?: CartItemDto[];
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

