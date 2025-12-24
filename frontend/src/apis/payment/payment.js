import axiosClient from './axiosClient';
export const paymentApi = {
    createPayment: (data) => {
        return axiosClient.post('/payment/create-banking', data);
    },
    getPaymentByOrder: (orderCode) => {
        return axiosClient.get(`/payment/by-order/${orderCode}`);
    },
};
