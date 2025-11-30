import { request } from './api/apiClient';

export interface SellerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export interface RevenueData {
  total: number;
  period: string;
  orders: number;
  growth?: number;
}

export const sellerAnalyticsApi = {
  /**
   * Lấy danh sách đơn hàng của seller
   */
  getOrders: (query?: { status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    return request<SellerOrder[]>(`/seller/orders${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Xác nhận đơn hàng
   */
  confirmOrder: (orderId: string) =>
    request<{ success: boolean; message: string }>(`/seller/orders/${orderId}/confirm`, {
      method: 'PUT',
      requireAuth: true,
    }),

  /**
   * Từ chối đơn hàng
   */
  rejectOrder: (orderId: string) =>
    request<{ success: boolean; message: string }>(`/seller/orders/${orderId}/reject`, {
      method: 'PUT',
      requireAuth: true,
    }),

  /**
   * Lấy dữ liệu doanh thu
   */
  getRevenue: (type?: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const queryString = params.toString();
    return request<RevenueData>(`/analytics/revenue${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },
};

