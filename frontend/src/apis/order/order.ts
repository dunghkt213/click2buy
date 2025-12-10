import axiosClient from './axiosClient'; // Giả sử bạn đã có axios instance

export const orderApi = {
  // Hàm tạo đơn hàng
  createOrder: async (data: {
    userId: string;
    paymentMethod: string;
    carts: any[]; // Cấu trúc cart giống input của backend
  }) => {
    // Gọi đến API Gateway (Gateway sẽ bắn Kafka sang Order Service)
    const url = '/orders/create'; 
    return axiosClient.post(url, data);
  },

  // Hàm thanh toán lại hoặc thanh toán đơn pending (nếu cần)
  payOrder: async (orderId: string) => {
    const url = `/orders/${orderId}/pay`;
    return axiosClient.post(url);
  }
};