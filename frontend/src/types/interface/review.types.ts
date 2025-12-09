/**
 * Review Types - Type definitions for Reviews
 */

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  date: string;
  helpful: number;
  isVerifiedPurchase?: boolean;
}

