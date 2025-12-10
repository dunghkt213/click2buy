/**
 * User Service - API service for users
 */

import { request } from '../apiClient';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  BackendUserDto,
  DeleteUserResponseDto,
} from '../../types/dto/user.dto';

export const userService = {
  /**
   * Tạo user mới (admin only)
   */
  create: (dto: CreateUserDto) =>
    request<BackendUserDto>('/users', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Lấy danh sách tất cả users (admin only)
   */
  findAll: (query?: UserQueryDto) => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.search) params.append('search', query.search);
    
    const queryString = params.toString();
    return request<BackendUserDto[]>(`/users${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Lấy thông tin một user
   */
  findOne: async (id: string): Promise<BackendUserDto> => {
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
    request<BackendUserDto>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Vô hiệu hóa user (soft delete)
   */
  deactivate: (id: string) =>
    request<DeleteUserResponseDto>(`/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

