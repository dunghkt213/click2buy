/**
 * Review API Module - Export all review-related APIs
 */

// Service (primary)
export * from './review.service';

// Mapper (primary - this is the canonical source for mapReviewResponse)
export * from './review.mapper';

// Legacy API - only export unique exports, not duplicates
export { reviewApi } from './reviewApi';
export type {
  BackendReview,
  CreateReviewDto,
  UpdateReviewDto,
} from './reviewApi';

