/**
 * Review Service - API service for reviews
 */

import { request } from '../client/apiClient';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  BackendReviewDto,
  DeleteReviewResponseDto,
} from '../../types/dto/review.dto';

export const reviewService = {
  /**
   * Tạo review mới
   */
  create: (dto: CreateReviewDto) =>
    request<BackendReviewDto>('/reviews', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Lấy tất cả reviews (có thể filter theo productId)
   */
  findAll: (query?: ReviewQueryDto) => {
    const params = new URLSearchParams();
    if (query?.productId) params.append('productId', query.productId);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    return request<BackendReviewDto[]>(`/reviews${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: false, // Reviews có thể xem công khai
    });
  },

  /**
   * Lấy một review theo ID
   */
  findOne: (id: string) =>
    request<BackendReviewDto>(`/reviews/${id}`, {
      method: 'GET',
      requireAuth: false, // Reviews có thể xem công khai
    }),

  /**
   * Cập nhật review
   */
  update: (id: string, dto: UpdateReviewDto) =>
    request<BackendReviewDto>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Xóa review
   */
  remove: (id: string) =>
    request<DeleteReviewResponseDto>(`/reviews/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

