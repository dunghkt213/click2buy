/**
 * User DTOs - Data Transfer Objects for Users
 */

// ============================================
// Request DTOs
// ============================================

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  name?: string;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

// ============================================
// Response DTOs
// ============================================

export interface DeleteUserResponseDto {
  success: boolean;
  message: string;
}

// ============================================
// Backend DTOs
// ============================================

export interface BackendUserDto {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  address?: any[];
}

