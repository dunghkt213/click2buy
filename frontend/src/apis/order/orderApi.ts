import { request } from '../client/apiClient';
import { Order } from '../../types';

export interface CreateOrderDto {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  paymentMethod: string;
  shippingMethod?: string;
  note?: string;
}

export interface BackendOrder {
  _id?: string;
  id?: string;
  orderNumber?: string;
  userId?: string;
  items?: Array<{
    productId: string;
    product?: any;
    quantity: number;
    price: number;
  }>;
  totalPrice?: number;
  shippingFee?: number;
  discount?: number;
  finalPrice?: number;
  status?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAddress?: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// mapOrderResponse is exported from order.mapper.ts - do not duplicate here

export const orderApi = {
  /**
   * Tạo đơn hàng mới
   */
  create: (dto: CreateOrderDto) =>
    request<BackendOrder>('/orders', {
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
    return request<BackendOrder[]>(url, {
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
    return request<BackendOrder[]>(url, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Hủy đơn hàng (cancel request) - Dùng cho orders đã được xác nhận
   * @param orderId - ID của đơn hàng cần hủy
   */
  cancelRequest: (orderId: string) =>
    request<{ success: boolean; message?: string }>(`/orders/${orderId}/cancel_request`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Hủy đơn hàng (cancel order) - Dùng cho orders đang chờ thanh toán (pending)
   * @param orderId - ID của đơn hàng cần hủy
   */
  cancelOrder: (orderId: string) =>
    request<BackendOrder>(`/orders/${orderId}/cancel_order`, {
      method: 'PATCH',
      requireAuth: true,
    }),

  /**
   * Xác nhận đã nhận hàng (buyer) - Complete order
   * @param orderId - ID của đơn hàng cần xác nhận đã nhận
   */
  markAsReceived: (orderId: string) =>
    request<BackendOrder>(`/orders/${orderId}/complete`, {
      method: 'PATCH',
      requireAuth: true,
    }),
};

