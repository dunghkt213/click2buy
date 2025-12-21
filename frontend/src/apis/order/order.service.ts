/**
 * Order Service - API service for orders
 */

import { request } from '../client/apiClient';
import {
  CreateOrderDto,
  OrderQueryDto,
  BackendOrderDto,
} from '../../types/dto/order.dto';

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  create: (dto: CreateOrderDto) =>
    request<BackendOrderDto>('/orders', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Lấy tất cả đơn hàng của seller
   * @param status - Trạng thái đơn hàng (PENDING_ACCEPT, REQUESTED_CANCEL, CONFIRMED, SHIPPING, DELIVERED)
   */
  getAllForSeller: (status?: string) => {
    const url = status 
      ? `/orders/seller?status=${encodeURIComponent(status)}`
      : '/orders/seller';
    return request<BackendOrderDto[]>(url, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Lấy tất cả đơn hàng của user (buyer)
   * @param status - Trạng thái đơn hàng (PENDING_PAYMENT, PENDING_ACCEPT, SHIPPING, DELIVERED, REJECTED)
   */
  getAllForUser: (status?: string) => {
    const url = status 
      ? `/orders/user?status=${encodeURIComponent(status)}`
      : '/orders/user';
    return request<BackendOrderDto[]>(url, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Hủy đơn hàng (cancel request)
   * @param orderId - ID của đơn hàng cần hủy
   */
  cancelRequest: (orderId: string) =>
    request<{ success: boolean; message?: string }>(`/orders/${orderId}/cancel_request`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Xác nhận đơn hàng (seller)
   * @param orderId - ID của đơn hàng cần xác nhận
   */
  confirmOrder: (orderId: string) =>
    request<BackendOrderDto>(`/orders/seller/${orderId}/confirm`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Từ chối đơn hàng (seller)
   * @param orderId - ID của đơn hàng cần từ chối
   */
  rejectOrder: (orderId: string) =>
    request<BackendOrderDto>(`/orders/seller/${orderId}/reject`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Chấp nhận yêu cầu hủy đơn hàng (seller)
   * @param orderId - ID của đơn hàng có yêu cầu hủy
   */
  acceptCancelRequest: (orderId: string) =>
    request<BackendOrderDto>(`/orders/${orderId}/cancel_request.accept`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Từ chối yêu cầu hủy đơn hàng (seller)
   * @param orderId - ID của đơn hàng có yêu cầu hủy
   */
  rejectCancelRequest: (orderId: string) =>
    request<BackendOrderDto>(`/orders/${orderId}/cancel_request.reject`, {
      method: 'PATCH',
      requireAuth: true,
    }),
};

