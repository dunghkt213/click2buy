import { request } from '../client/apiClient';
import { User } from '../../types';

export interface BackendUser {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  role?: string;
  phone?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  name?: string;
}

// normalizeUser is exported from user.mapper.ts - do not duplicate here

export const userApi = {
  /**
   * Tạo user mới (admin only)
   */
  create: (dto: CreateUserDto) =>
    request<BackendUser>('/users', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Lấy danh sách tất cả users (admin only)
   */
  findAll: (query?: { page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    
    const queryString = params.toString();
    return request<BackendUser[]>(`/users${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Lấy thông tin một user
   */
  findOne: async (id: string): Promise<BackendUser> => {
    const response = await request<any>(`/users/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
    // Backend có thể trả về trực tiếp hoặc wrap trong data
    return response.data || response;
  },

  /**
   * Cập nhật thông tin user
   */
  update: (id: string, dto: UpdateUserDto) =>
    request<BackendUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Vô hiệu hóa user (soft delete)
   */
  deactivate: (id: string) =>
    request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

