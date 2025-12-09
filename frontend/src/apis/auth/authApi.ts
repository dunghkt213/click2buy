import { User } from '../../types';
import { request } from '../client/apiClient';

const AUTH_USER_KEY = 'click2buy:authUser';
const AUTH_TOKEN_KEY = 'click2buy:accessToken';

export interface BackendUser {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  role?: string;
  phone?: string;
}

export interface AuthSuccessResponse {
  user: BackendUser;
  accessToken: string;
}

export interface AuthSuccessPayload {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otp?: string; // Chỉ có trong dev mode
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}


export function normalizeUser(backendUser: BackendUser): User {
  const fallbackName =
    backendUser.name || backendUser.username || backendUser.email || 'Người dùng';

  return {
    id: backendUser.id || backendUser._id || '',
    name: fallbackName,
    email: backendUser.email || '',
    avatar: backendUser.avatar,
    membershipLevel: 'Bronze',
    points: 0,
    role: backendUser.role as 'customer' | 'seller' | 'admin' | undefined, // THÊM: Giữ lại role từ backend
  };
}

export function mapAuthResponse(response: AuthSuccessResponse): AuthSuccessPayload {
  return {
    user: normalizeUser(response.user),
    accessToken: response.accessToken,
  };
}

export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthSuccessResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: false,
    }),
  register: (payload: RegisterPayload) =>
    request<AuthSuccessResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: false,
    }),
  refresh: () =>
    request<{ accessToken: string; message: string }>('/auth/refresh', {
      method: 'POST',
      requireAuth: false,
    }),
  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
      requireAuth: false,
    }),
  // SMS OTP Login
  sendOtp: (payload: SendOtpPayload) =>
    request<SendOtpResponse>('/auth/login-sms', {
      method: 'POST',
      body: JSON.stringify(payload),
      requireAuth: false,
    }),
  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthSuccessResponse> => {
    const response = await request<any>('/auth/verify-sms', {
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
  save(user: User, token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
  getUser(): User | undefined {
    if (typeof window === 'undefined') return undefined;
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return undefined;
    }
  },
  getToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
  },
};

