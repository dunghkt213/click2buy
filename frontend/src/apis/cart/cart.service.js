/**
 * Cart Service - API service for cart
 */
import { request } from '../client/apiClient';
export const cartService = {
    /**
     * Lấy tất cả giỏ hàng theo seller
     */
    getAll: () => request('/cart', {
        method: 'GET',
        requireAuth: true,
    }),
    /**
     * Thêm sản phẩm vào giỏ hàng
     */
    addItem: (dto) => request('/cart', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Cập nhật item trong giỏ hàng
     */
    updateItem: (dto) => request('/cart/update', {
        method: 'PATCH',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Cập nhật số lượng sản phẩm
     */
    updateQuantity: (dto) => request('/cart/productQuantity', {
        method: 'PATCH',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Xóa sản phẩm khỏi giỏ hàng
     */
    removeItem: (dto) => request('/cart/product', {
        method: 'DELETE',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Tạo đơn hàng từ giỏ hàng
     */
    createOrder: (dto) => request('/cart/order', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
};
