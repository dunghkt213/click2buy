import { request } from '../client/apiClient';
// normalizeUser is exported from user.mapper.ts - do not duplicate here
export const userApi = {
    /**
     * Tạo user mới (admin only)
     */
    create: (dto) => request('/users', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Lấy danh sách tất cả users (admin only)
     */
    findAll: (query) => {
        const params = new URLSearchParams();
        if (query?.page)
            params.append('page', query.page.toString());
        if (query?.limit)
            params.append('limit', query.limit.toString());
        if (query?.search)
            params.append('search', query.search);
        const queryString = params.toString();
        return request(`/users${queryString ? `?${queryString}` : ''}`, {
            method: 'GET',
            requireAuth: true,
        });
    },
    /**
     * Lấy thông tin một user
     */
    findOne: async (id) => {
        const response = await request(`/users/${id}`, {
            method: 'GET',
            requireAuth: true,
        });
        // Backend có thể trả về trực tiếp hoặc wrap trong data
        return response.data || response;
    },
    /**
     * Cập nhật thông tin user
     */
    update: (id, dto) => request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
        requireAuth: true,
    }),
    /**
     * Vô hiệu hóa user (soft delete)
     */
    deactivate: (id) => request(`/users/${id}`, {
        method: 'DELETE',
        requireAuth: true,
    }),
    /**
     * Cập nhật role user lên seller
     * Server trả về { user, accessToken }
     */
    updateRoleSeller: (payload) => request('/users/seller', {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: true,
    }),
};
