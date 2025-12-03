import { ProductReview } from '../../types';
import { request } from '../client/apiClient';

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface BackendReview {
  _id?: string;
  id?: string;
  userId?: string;
  user?: {
    username?: string;
    name?: string;
    avatar?: string;
  };
  productId?: string;
  rating?: number;
  comment?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  helpful?: number;
  isVerifiedPurchase?: boolean;
}

// mapReviewResponse is exported from review.mapper.ts - do not duplicate here

export const reviewApi = {
  /**
   * Tạo review mới
   */
  create: (dto: CreateReviewDto) =>
    request<BackendReview>('/reviews', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Lấy tất cả reviews (có thể filter theo productId)
   */
  findAll: (query?: { productId?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.productId) params.append('productId', query.productId);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    return request<BackendReview[]>(`/reviews${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: false, // Reviews có thể xem công khai
    });
  },

  /**
   * Lấy một review theo ID
   */
  findOne: (id: string) =>
    request<BackendReview>(`/reviews/${id}`, {
      method: 'GET',
      requireAuth: false, // Reviews có thể xem công khai
    }),

  /**
   * Cập nhật review
   */
  update: (id: string, dto: UpdateReviewDto) =>
    request<BackendReview>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    }),

  /**
   * Xóa review
   */
  remove: (id: string) =>
    request<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    }),
};

