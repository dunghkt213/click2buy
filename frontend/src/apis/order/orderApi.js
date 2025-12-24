import { request } from '../client/apiClient';
// mapOrderResponse is exported from order.mapper.ts - do not duplicate here
export const orderApi = {
    /**
     * Tạo đơn hàng mới
     */
    create: (dto) => request('/orders', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Lấy tất cả đơn hàng của seller
     * @param status - Trạng thái đơn hàng (PENDING_ACCEPT, REQUESTED_CANCEL, CONFIRMED, SHIPPING, DELIVERED)
     */
    getAllForSeller: (status) => {
        const url = status
            ? `/orders/seller?status=${encodeURIComponent(status)}`
            : '/orders/seller';
        return request(url, {
            method: 'GET',
            requireAuth: true,
        });
    },
    /**
     * Lấy tất cả đơn hàng của user (buyer)
     * @param status - Trạng thái đơn hàng (PENDING_PAYMENT, PENDING_ACCEPT, SHIPPING, DELIVERED, REJECTED)
     */
    getAllForUser: (status) => {
        const url = status
            ? `/orders/user?status=${encodeURIComponent(status)}`
            : '/orders/user';
        return request(url, {
            method: 'GET',
            requireAuth: true,
        });
    },
    /**
     * Hủy đơn hàng (cancel request) - Dùng cho orders đã được xác nhận
     * @param orderId - ID của đơn hàng cần hủy
     */
    cancelRequest: (orderId) => request(`/orders/${orderId}/cancel_request`, {
        method: 'PATCH',
        requireAuth: true,
    }),
    /**
     * Hủy đơn hàng (cancel order) - Dùng cho orders đang chờ thanh toán (pending)
     * @param orderId - ID của đơn hàng cần hủy
     */
    cancelOrder: (orderId) => request(`/orders/${orderId}/cancel_order`, {
        method: 'PATCH',
        requireAuth: true,
    }),
    /**
     * Xác nhận đã nhận hàng (buyer) - Complete order
     * @param orderId - ID của đơn hàng cần xác nhận đã nhận
     */
    markAsReceived: (orderId) => request(`/orders/${orderId}/complete`, {
        method: 'PATCH',
        requireAuth: true,
    }),
};
