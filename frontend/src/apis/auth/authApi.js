import { request } from '../client/apiClient';
const AUTH_USER_KEY = 'click2buy:authUser';
const AUTH_TOKEN_KEY = 'click2buy:accessToken';
export function normalizeUser(backendUser) {
    const fallbackName = backendUser.name || backendUser.username || backendUser.email || 'Người dùng';
    return {
        id: backendUser.id || backendUser._id || '',
        name: fallbackName,
        email: backendUser.email || '',
        avatar: backendUser.avatar,
        membershipLevel: 'Bronze',
        points: 0,
        role: backendUser.role, // THÊM: Giữ lại role từ backend
    };
}
export function mapAuthResponse(response) {
    return {
        user: normalizeUser(response.user),
        accessToken: response.accessToken,
    };
}
export const authApi = {
    login: (payload) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: false,
    }),
    register: (payload) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: false,
    }),
    refresh: () => request('/auth/refresh', {
        method: 'POST',
        requireAuth: false,
    }),
    logout: () => request('/auth/logout', {
        method: 'POST',
        requireAuth: false,
    }),
    // SMS OTP Login
    sendOtp: (payload) => request('/auth/login-sms', {
        method: 'POST',
        body: JSON.stringify(payload),
        requireAuth: false,
    }),
    verifyOtp: async (payload) => {
        const response = await request('/auth/verify-sms', {
            method: 'POST',
            body: JSON.stringify(payload),
            requireAuth: false,
        });
        // Backend trả về { message, user, accessToken }, cần map về AuthSuccessResponse
        return {
            user: response.user,
            accessToken: response.accessToken,
        };
    },
};
export const authStorage = {
    save(user, token) {
        if (typeof window === 'undefined')
            return;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    },
    clear() {
        if (typeof window === 'undefined')
            return;
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    },
    getUser() {
        if (typeof window === 'undefined')
            return undefined;
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!raw)
            return undefined;
        try {
            return JSON.parse(raw);
        }
        catch {
            return undefined;
        }
    },
    getToken() {
        if (typeof window === 'undefined')
            return undefined;
        return localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
    },
};
