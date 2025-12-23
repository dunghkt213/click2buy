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
  createdAt?: string;
  updatedAt?: string;
  helpful: number;
  isVerifiedPurchase?: boolean;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

