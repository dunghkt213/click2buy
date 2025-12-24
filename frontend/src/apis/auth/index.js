/**
 * Auth API Module - Export all auth-related APIs
 */
// Storage utilities (primary export)
export * from './auth.storage';
// Mappers (primary export)
export * from './auth.mapper';
// Services (primary export)
export * from './auth.service';
// Legacy API - only export unique exports, not duplicates
export { authApi } from './authApi';
