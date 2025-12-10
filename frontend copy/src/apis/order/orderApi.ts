import { request } from '../apiClient';
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
   */
  getAllForSeller: () =>
    request<BackendOrder[]>('/orders/seller', {
      method: 'GET',
      requireAuth: true,
    }),
};

