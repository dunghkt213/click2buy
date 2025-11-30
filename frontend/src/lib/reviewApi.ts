import { ProductReview } from '../types';
import { request } from './api/apiClient';

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

export function mapReviewResponse(data: BackendReview): ProductReview {
  return {
    id: data._id || data.id || '',
    userId: data.userId || '',
    userName: data.user?.name || data.user?.username || 'Người dùng',
    userAvatar: data.user?.avatar,
    rating: data.rating || 0,
    comment: data.comment || '',
    images: data.images,
    date: data.createdAt || data.updatedAt || new Date().toISOString(),
    helpful: data.helpful || 0,
    isVerifiedPurchase: data.isVerifiedPurchase,
  };
}

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

