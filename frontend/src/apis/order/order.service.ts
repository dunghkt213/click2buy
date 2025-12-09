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
   */
  getAllForSeller: () =>
    request<BackendOrderDto[]>('/orders/seller', {
      method: 'GET',
      requireAuth: true,
    }),
};

