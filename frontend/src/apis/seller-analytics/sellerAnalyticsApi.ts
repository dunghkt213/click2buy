// src/services/sellerService.ts
import { RevenueDataItem, TopProductItem } from '../../types/dto/seller-analytics.dto'; // Import type vừa tạo

const API_URL = 'http://localhost:3000'; // Đổi port nếu cần

const getAuthHeaders = () => {
  // 👇 SỬA LẠI: Lấy đúng key "click2buy:accessToken"
  // LƯU Ý: Nếu token được lưu dưới dạng JSON String (ví dụ: "eyJhbGciOiJIUzI1NiI...") thì không cần parse.
  // Nếu nó nằm trong 1 object bự hơn, bạn cần parse JSON.
  
  // Chúng ta sẽ thử lấy thẳng chuỗi token ra.
  const rawToken = localStorage.getItem('click2buy:accessToken');

  // Thường thì Local Storage sẽ lưu JSON String. Cần parse nó.
  let token = null;

  if (rawToken) {
    try {
      // Ví dụ: nó lưu là '{"token":"eyJhbGciOiJIUzI1NiI...","user":{...}}'
      const parsed = JSON.parse(rawToken);
      
      // Nếu token nằm ngay ở root object sau khi parse (Rất phổ biến trong Redux-persist)
      // Tìm field có chứa token. Thường là 'token' hoặc 'accessToken'.
      token = parsed.accessToken || parsed.token;
      
      // Nếu nó chỉ là một chuỗi token trần (không phải JSON string), thì dùng rawToken
      if (!token && typeof parsed === 'string') {
          token = parsed;
      }

    } catch (e) {
      // Trường hợp rawToken chỉ là chuỗi token trần (không phải JSON string)
      token = rawToken; 
    }
  }
  
  // --- LOG ĐỂ KIỂM TRA ---
  if (token) {
      console.log("✅ Đã lấy Token thành công:", token.substring(0, 10) + "...");
  } else {
      console.error("❌ Lỗi: Không thể trích xuất Token từ LocalStorage Key 'click2buy:accessToken'.");
  }


  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
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