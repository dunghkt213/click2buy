// Export all API modules
// Note: Export types separately to avoid conflicts

// API Client
export * from './api/apiClient';

// Auth API
export { authApi, authStorage, mapAuthResponse, normalizeUser as normalizeAuthUser } from './authApi';
export type { BackendUser as AuthBackendUser, AuthSuccessPayload, AuthSuccessResponse, LoginPayload, RegisterPayload } from './authApi';

// User API
export { normalizeUser, userApi } from './userApi';
export type { BackendUser, CreateUserDto, UpdateUserDto } from './userApi';

// Product API
export * from './productApi';

// Cart API
export { cartApi } from './cartApi';
export type { AddToCartDto, CartResponse, CreateOrderDto as CreateOrderFromCartDto, RemoveCartItemDto, UpdateCartItemDto, UpdateQuantityDto } from './cartApi';

// Order API
export { mapOrderResponse, orderApi } from './orderApi';
export type { BackendOrder, CreateOrderDto } from './orderApi';

// Review API
export { mapReviewResponse, reviewApi } from './reviewApi';
export type { BackendReview, CreateReviewDto, UpdateReviewDto } from './reviewApi';

// Media API
export * from './mediaApi';

// Seller Analytics API
export * from './sellerAnalyticsApi';

