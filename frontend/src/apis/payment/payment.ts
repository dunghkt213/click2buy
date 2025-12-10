import axiosClient from './axiosClient';

export const paymentApi = {
  createPayment: (data: {
    userId: string;
    orderIds: string[];
    paymentMethod: string;
    total: number;
  }) => {
    // Gọi đến API Gateway -> Payment Service
    return axiosClient.post('/payments/create', data);
  }
};