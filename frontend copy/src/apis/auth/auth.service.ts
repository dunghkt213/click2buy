/**
 * Auth Service - API service for authentication
 */

import { request } from '../apiClient';
import {
  LoginDto,
  RegisterDto,
  SendOtpDto,
  VerifyOtpDto,
  AuthSuccessResponseDto,
  SendOtpResponseDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
} from '../../types/dto/auth.dto';
import { normalizeUser } from './auth.mapper';
import { AuthSuccessPayload } from '../../types/interface/auth.types';

export const authService = {
  /**
   * Login với username/password
   */
  login: (dto: LoginDto) =>
    request<AuthSuccessResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: false,
    }),

  /**
   * Đăng ký tài khoản mới
   */
  register: (dto: RegisterDto) =>
    request<AuthSuccessResponseDto>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: false,
    }),

  /**
   * Refresh access token
   */
  refresh: () =>
    request<RefreshTokenResponseDto>('/auth/refresh', {
      method: 'POST',
      requireAuth: false,
    }),

  /**
   * Logout
   */
  logout: () =>
    request<LogoutResponseDto>('/auth/logout', {
      method: 'POST',
      requireAuth: false,
    }),

  /**
   * Gửi OTP qua SMS
   */
  sendOtp: (dto: SendOtpDto) =>
    request<SendOtpResponseDto>('/auth/login-sms', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: false,
    }),

  /**
   * Verify OTP và đăng nhập
   */
  verifyOtp: async (dto: VerifyOtpDto): Promise<AuthSuccessResponseDto> => {
    const response = await request<any>('/auth/verify-sms', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: false,
    });
    
    // Backend trả về { message, user, accessToken }, cần map về AuthSuccessResponseDto
    return {
      user: response.user,
      accessToken: response.accessToken,
    };
  },
};

/**
 * Map auth response to frontend payload
 */
export function mapAuthResponse(response: AuthSuccessResponseDto): AuthSuccessPayload {
  return {
    user: normalizeUser(response.user),
    accessToken: response.accessToken,
  };
}

