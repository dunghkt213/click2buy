/**
 * User API Module - Export all user-related APIs
 */

// Service (primary)
export * from './user.service';

// Mapper (primary - this is the canonical source for normalizeUser)
export * from './user.mapper';

// Legacy API - only export unique exports, not duplicates
export { userApi } from './userApi';
export type {
  BackendUser,
  CreateUserDto,
  UpdateUserDto,
} from './userApi';

