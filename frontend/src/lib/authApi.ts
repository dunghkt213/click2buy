import { User } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    // ignore JSON parse errors, will handle below
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      'Yêu cầu thất bại. Vui lòng thử lại.';
    throw new Error(message);
  }

  return payload as T;
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
    }),
  register: (payload: RegisterPayload) =>
    request<AuthSuccessResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<{ success: boolean; message: string }>('/auth/logout', {
      method: 'POST',
    }),
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

