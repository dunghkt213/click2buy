/**
 * Review DTOs - Data Transfer Objects for Reviews
 */

// ============================================
// Request DTOs
// ============================================

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

export interface ReviewQueryDto {
  productId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Response DTOs
// ============================================

export interface DeleteReviewResponseDto {
  success: boolean;
  message: string;
}

// ============================================
// Backend DTOs
// ============================================

export interface BackendReviewDto {
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

