/**
 * Review Mapper - Maps backend review responses to frontend types
 */

import { BackendReviewDto } from '../../types/dto/review.dto';
import { ProductReview } from '../../types/interface/review.types';

export function mapReviewResponse(data: BackendReviewDto): ProductReview {
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

