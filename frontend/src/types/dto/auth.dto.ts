/**
 * Auth DTOs - Data Transfer Objects for Authentication
 */

// ============================================
// Request DTOs
// ============================================

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface SendOtpDto {
  phone: string;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
}

// ============================================
// Response DTOs
// ============================================

export interface AuthSuccessResponseDto {
  user: BackendUserDto;
  accessToken: string;
}

export interface SendOtpResponseDto {
  success: boolean;
  message: string;
  otp?: string; // Chỉ có trong dev mode
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  message: string;
}

export interface LogoutResponseDto {
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

