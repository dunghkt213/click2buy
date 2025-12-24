/**
 * Review Service - API service for reviews
 */
import { request } from '../client/apiClient';
export const reviewService = {
    /**
     * Tạo review mới
     */
    create: (dto) => request('/reviews', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Lấy tất cả reviews (có thể filter theo productId)
     */
    findAll: (query) => {
        const params = new URLSearchParams();
        if (query?.productId)
            params.append('productId', query.productId);
        if (query?.page)
            params.append('page', query.page.toString());
        if (query?.limit)
            params.append('limit', query.limit.toString());
        const queryString = params.toString();
        return request(`/reviews${queryString ? `?${queryString}` : ''}`, {
            method: 'GET',
            requireAuth: false, // Reviews có thể xem công khai
        });
    },
    /**
     * Lấy một review theo ID
     */
    findOne: (id) => request(`/reviews/${id}`, {
        method: 'GET',
        requireAuth: false, // Reviews có thể xem công khai
    }),
    /**
     * Cập nhật review
     */
    update: (id, dto) => request(`/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Xóa review
     */
    remove: (id) => request(`/reviews/${id}`, {
        method: 'DELETE',
        requireAuth: true,
    }),
};
