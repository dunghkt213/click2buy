// src/services/sellerService.ts
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto'; // Import type vừa tạo
import { authStorage } from '../auth';

const API_URL = 'http://localhost:3000'; // Đổi port nếu cần

const getAuthHeaders = () => {
  // Lấy token từ authStorage (sử dụng đúng key 'click2buy:accessToken')
  const token = authStorage.getToken();

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const sellerService = {
  // API lấy doanh thu
  getRevenue: async (type: 'WEEK' | 'MONTH') => {
    try {
      const response = await fetch(`${API_URL}/seller-analytics/revenue?type=${type}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      // Xử lý khi token hết hạn (401)
      if (response.status === 401) {
          console.error("⛔ Token hết hạn hoặc không hợp lệ. Hãy đăng nhập lại.");
          // Tùy chọn: window.location.href = '/login';
      }

      if (!response.ok) throw new Error('Lỗi tải doanh thu');
      return await response.json();
    } catch (error) {
      console.error("Lỗi getRevenue:", error);
      return [];
    }
  },

  // API lấy top sản phẩm
  getTopProducts: async (limit: number = 5) => {
    try {
      const response = await fetch(`${API_URL}/seller-analytics/top-products?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Lỗi tải top sản phẩm');
      return await response.json();
    } catch (error) {
      console.error("Lỗi getTopProducts:", error);
      return [];
    }
  }
};