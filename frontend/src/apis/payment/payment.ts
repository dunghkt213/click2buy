import axiosClient from './axiosClient';

export interface CreatePaymentPayload {
  orderCode: string;
}

export interface PaymentByOrderResponse {
  exists: boolean;
  status?: 'PENDING' | 'SUCCESS' | 'EXPIRED';
  orderCode?: string;
  qrCode?: string;
  checkoutUrl?: string;
  expiredAt?: string;
  expireIn?: number;
}


export const paymentApi = {
  createPayment: (data: CreatePaymentPayload) => {
    return axiosClient.post('/payment/create-banking', data);
  },
  getPaymentByOrder: (orderCode: string) => {
    return axiosClient.get<PaymentByOrderResponse>(
      `/payment/by-order/${orderCode}`
    );
  },
};