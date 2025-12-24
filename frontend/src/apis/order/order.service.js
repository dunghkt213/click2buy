/**
 * Order Service - API service for orders
 */
import { request } from '../client/apiClient';
export const orderService = {
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
     * Xác nhận đơn hàng (seller)
     * @param orderId - ID của đơn hàng cần xác nhận
     */
    confirmOrder: (orderId) => request(`/orders/seller/${orderId}/confirm`, {
        method: 'PATCH',
        requireAuth: true,
    }),
    /**
     * Từ chối đơn hàng (seller)
     * @param orderId - ID của đơn hàng cần từ chối
     */
    rejectOrder: (orderId) => request(`/orders/seller/${orderId}/reject`, {
        method: 'PATCH',
        requireAuth: true,
    }),
    /**
     * Chấp nhận yêu cầu hủy đơn hàng (seller)
     * @param orderId - ID của đơn hàng có yêu cầu hủy
     */
    acceptCancelRequest: (orderId) => request(`/orders/${orderId}/cancel_request.accept`, {
        method: 'PATCH',
        requireAuth: true,
    }),
    /**
     * Từ chối yêu cầu hủy đơn hàng (seller)
     * @param orderId - ID của đơn hàng có yêu cầu hủy
     */
    rejectCancelRequest: (orderId) => request(`/orders/${orderId}/cancel_request.reject`, {
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
