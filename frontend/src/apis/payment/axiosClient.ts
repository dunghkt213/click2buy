import axios from 'axios';
import { authStorage } from '../auth';
import { API_BASE_URL } from '../client/baseUrl';

// 1. Tạo instance (bản sao) của axios với cấu hình mặc định
const axiosClient = axios.create({
  // URL gốc của API Gateway (Backend)
  // Nếu bạn chạy Next.js/React local thì thường là localhost:3000 hoặc 3001
  // Dựa vào docker-compose của bạn, API Gateway đang chạy port 3000
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },

  // Thời gian chờ tối đa (10 giây)
  timeout: 10000,
});

// 2. Cấu hình Interceptors (Bộ đón chặn) cho REQUEST
// Tác dụng: Tự động gắn Token vào mỗi API gửi đi
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ authStorage (sử dụng đúng key 'click2buy:accessToken')
    const token = authStorage.getToken();

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Cấu hình Interceptors cho RESPONSE
// Tác dụng: Xử lý dữ liệu trả về hoặc lỗi chung (vd: hết hạn token)
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp để đỡ phải gọi response.data ở nơi khác
    return response;
  },
  (error) => {
    // Xử lý lỗi chung (Ví dụ: 401 Unauthorized -> Đẩy về trang login)
    if (error.response && error.response.status === 401) {
      // Logic logout hoặc refresh token có thể đặt ở đây
      console.log("Hết phiên đăng nhập");
      // window.location.href = '/login'; // Tùy chọn chuyển trang
    }
    return Promise.reject(error);
  }
);

export default axiosClient;