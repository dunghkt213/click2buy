import { request } from './api/apiClient';
import { CartItem } from '../types';

export interface CartResponse {
  sellerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product?: any;
  }>;
  total: number;
}

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

export interface UpdateQuantityDto {
  sellerId: string;
  productId: string;
  quantity: number;
}

export interface RemoveCartItemDto {
  sellerId: string;
  productId: string;
}

export interface CreateOrderDto {
  items: Array<{
    sellerId: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

export const cartApi = {
  /**
   * Lấy tất cả giỏ hàng theo seller
   */
  getAll: () =>
    request<CartResponse[]>('/cart', {
      method: 'GET',
      requireAuth: true,
    }),

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addItem: (dto: AddToCartDto) =>
    request<CartResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Cập nhật item trong giỏ hàng
   */
  updateItem: (dto: UpdateCartItemDto) =>
    request<CartResponse>('/cart/update', {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Cập nhật số lượng sản phẩm
   */
  updateQuantity: (dto: UpdateQuantityDto) =>
    request<CartResponse>('/cart/productQuantity', {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem: (dto: RemoveCartItemDto) =>
    request<{ success: boolean; message: string }>('/cart/product', {
      method: 'DELETE',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Tạo đơn hàng từ giỏ hàng
   */
  createOrder: (dto: CreateOrderDto) =>
    request<any>('/cart/order', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),
};

