/**
 * Cart Service - API service for cart
 */

import { request } from '../apiClient';
import {
  AddToCartDto,
  UpdateCartItemDto,
  UpdateCartQuantityDto,
  RemoveCartItemDto,
  CreateOrderFromCartDto,
  CartResponseDto,
  RemoveCartItemResponseDto,
} from '../../types/dto/cart.dto';

export const cartService = {
  /**
   * Lấy tất cả giỏ hàng theo seller
   */
  getAll: () =>
    request<CartResponseDto[]>('/cart', {
      method: 'GET',
      requireAuth: true,
    }),

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addItem: (dto: AddToCartDto) =>
    request<CartResponseDto>('/cart', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Cập nhật item trong giỏ hàng
   */
  updateItem: (dto: UpdateCartItemDto) =>
    request<CartResponseDto>('/cart/update', {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Cập nhật số lượng sản phẩm
   */
  updateQuantity: (dto: UpdateCartQuantityDto) =>
    request<CartResponseDto>('/cart/productQuantity', {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem: (dto: RemoveCartItemDto) =>
    request<RemoveCartItemResponseDto>('/cart/product', {
      method: 'DELETE',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Tạo đơn hàng từ giỏ hàng
   */
  createOrder: (dto: CreateOrderFromCartDto) =>
    request<any>('/cart/order', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),
};

