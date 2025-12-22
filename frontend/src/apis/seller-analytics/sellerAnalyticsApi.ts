/**
 * Seller Analytics API Service
 * Kết nối với Seller Analytics Service thông qua API Gateway
 * Endpoints:
 * - GET /seller-analytics/revenue?type=WEEK|MONTH
 * - GET /seller-analytics/top-products?limit=5
 */
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto';
import { authStorage } from '../auth';

// Sử dụng API Gateway URL (port 3000)
const API_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

const getAuthHeaders = () => {
  // Lấy token từ authStorage (sử dụng đúng key 'click2buy:accessToken')
  const token = authStorage.getToken();

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const sellerService = {
  /**
   * Lấy thống kê doanh thu theo ngày
   * @param type - 'WEEK' hoặc 'MONTH' (mặc định: WEEK)
   * @returns Promise<RevenueDataItem[]>
   */
  getRevenue: async (type: 'WEEK' | 'MONTH' = 'WEEK'): Promise<RevenueDataItem[]> => {
    try {
      const response = await fetch(`${API_URL}/seller-analytics/revenue?type=${type}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      // Xử lý khi token hết hạn (401)
      if (response.status === 401) {
        console.error("⛔ Token hết hạn hoặc không hợp lệ. Hãy đăng nhập lại.");
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Xử lý khi không có quyền (403)
      if (response.status === 403) {
        console.error("⛔ Không có quyền truy cập. Chỉ seller mới có thể xem analytics.");
        throw new Error('Bạn không có quyền xem thống kê doanh thu. Chỉ seller mới có thể truy cập.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi tải doanh thu: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Lỗi getRevenue:", error);
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
      const response = await fetch(`${API_URL}/seller-analytics/top-products?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      // Xử lý khi token hết hạn (401)
      if (response.status === 401) {
        console.error("⛔ Token hết hạn hoặc không hợp lệ. Hãy đăng nhập lại.");
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Xử lý khi không có quyền (403)
      if (response.status === 403) {
        console.error("⛔ Không có quyền truy cập. Chỉ seller mới có thể xem analytics.");
        throw new Error('Bạn không có quyền xem thống kê sản phẩm. Chỉ seller mới có thể truy cập.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi tải top sản phẩm: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error("Lỗi getTopProducts:", error);
      throw error; // Re-throw để component có thể xử lý
    }
  }
};