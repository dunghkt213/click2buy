import { request } from './api/apiClient';
import { Order } from '../types';

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

export function mapOrderResponse(data: BackendOrder): Order {
  return {
    id: data._id || data.id || '',
    orderNumber: data.orderNumber || `ORD-${data._id || data.id || ''}`,
    items: (data.items || []).map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.product?.name || 'Sản phẩm',
      image: item.product?.image || item.product?.images?.[0] || '',
      price: item.price,
      quantity: item.quantity,
    })),
    totalPrice: data.totalPrice || 0,
    shippingFee: data.shippingFee || 0,
    discount: data.discount || 0,
    finalPrice: data.finalPrice || data.totalPrice || 0,
    status: (data.status as Order['status']) || 'pending',
    paymentMethod: data.paymentMethod || 'cod',
    shippingMethod: data.shippingMethod || 'standard',
    shippingAddress: data.shippingAddress || {
      name: '',
      phone: '',
      address: '',
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    timeline: [],
  };
}

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

