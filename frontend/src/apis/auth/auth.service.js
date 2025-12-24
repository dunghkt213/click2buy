/**
 * Auth Service - API service for authentication
 */
import { request } from '../client/apiClient';
import { normalizeUser } from './auth.mapper';
export const authService = {
    /**
     * Login với username/password
     */
    login: (dto) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: false,
    }),
    /**
     * Đăng ký tài khoản mới
     */
    register: (dto) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: false,
    }),
    /**
     * Refresh access token
     */
    refresh: () => request('/auth/refresh', {
        method: 'POST',
        requireAuth: false,
    }),
    /**
     * Logout
     */
    logout: () => request('/auth/logout', {
        method: 'POST',
        requireAuth: false,
    }),
    /**
     * Gửi OTP qua SMS
     */
    sendOtp: (dto) => request('/auth/login-sms', {
        method: 'POST',
        body: JSON.stringify(dto),
        requireAuth: false,
    }),
    /**
     * Verify OTP và đăng nhập
     */
    verifyOtp: async (dto) => {
        const response = await request('/auth/verify-sms', {
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
export function mapAuthResponse(response) {
    return {
        user: normalizeUser(response.user),
        accessToken: response.accessToken,
    };
}
