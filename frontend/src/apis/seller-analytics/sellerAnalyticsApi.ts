/**
 * Seller Analytics API Service
 * Kết nối với Seller Analytics Service thông qua API Gateway
 * Endpoints:
 * - GET /seller-analytics/revenue?type=WEEK|MONTH
 * - GET /seller-analytics/top-products?limit=5
 */
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto';
import { request } from '../client/apiClient';

export const sellerService = {
  /**
   * Lấy thống kê doanh thu theo ngày
   * @param type - 'WEEK' hoặc 'MONTH' (mặc định: WEEK)
   * @returns Promise<RevenueDataItem[]>
   */
  getRevenue: async (type: 'WEEK' | 'MONTH' = 'WEEK'): Promise<RevenueDataItem[]> => {
    try {
      // Sử dụng apiClient.request để có auto refresh token
      const data = await request<RevenueDataItem[]>(`/seller-analytics/revenue?type=${type}`, {
        method: 'GET',
        requireAuth: true,
      });
      
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Lỗi getRevenue:", error);
      
      // Xử lý lỗi 403 (Forbidden) - chỉ seller mới có quyền
      if (error?.status === 403) {
        throw new Error('Bạn không có quyền xem thống kê doanh thu. Chỉ seller mới có thể truy cập.');
      }
      
      throw error; // Re-throw để component có thể xử lý
    }
  },

  /**
   * Lấy danh sách sản phẩm bán chạy nhất
   * @param limit - Số lượng sản phẩm (mặc định: 5)
   * @returns Promise<TopProductItem[]>
   */
  getTopProducts: async (limit: number = 5): Promise<TopProductItem[]> => {
    try {
      // Sử dụng apiClient.request để có auto refresh token
      const data = await request<TopProductItem[]>(`/seller-analytics/top-products?limit=${limit}`, {
        method: 'GET',
        requireAuth: true,
      });
      
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Lỗi getTopProducts:", error);
      
      // Xử lý lỗi 403 (Forbidden) - chỉ seller mới có quyền
      if (error?.status === 403) {
        throw new Error('Bạn không có quyền xem thống kê sản phẩm. Chỉ seller mới có thể truy cập.');
      }
      
      throw error; // Re-throw để component có thể xử lý
    }
  }
};