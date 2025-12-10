/**
 * Seller Analytics Service - API service for seller analytics
 */

import { request } from '../client/apiClient';
import {
  SellerOrderQueryDto,
  RevenueQueryDto,
  SellerOrderDto,
  RevenueDataDto,
  ConfirmOrderResponseDto,
  RejectOrderResponseDto,
} from '../../types/dto/seller-analytics.dto';

export const sellerAnalyticsService = {
  /**
   * Lấy danh sách đơn hàng của seller
   */
  getOrders: (query?: SellerOrderQueryDto) => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    return request<SellerOrderDto[]>(`/seller/orders${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Xác nhận đơn hàng
   */
  confirmOrder: (orderId: string) =>
    request<ConfirmOrderResponseDto>(`/seller/orders/${orderId}/confirm`, {
      method: 'PUT',
      requireAuth: true,
    }),

  /**
   * Từ chối đơn hàng
   */
  rejectOrder: (orderId: string) =>
    request<RejectOrderResponseDto>(`/seller/orders/${orderId}/reject`, {
      method: 'PUT',
      requireAuth: true,
    }),

  /**
   * Lấy dữ liệu doanh thu
   */
  getRevenue: (query?: RevenueQueryDto) => {
    const params = new URLSearchParams();
    if (query?.type) params.append('type', query.type);
    
    const queryString = params.toString();
    return request<RevenueDataDto>(`/analytics/revenue${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },
};

