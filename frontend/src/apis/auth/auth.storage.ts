/**
 * Auth Storage - Local storage utilities for authentication
 */

import { User } from '../../types/interface/auth.types';

const AUTH_USER_KEY = 'click2buy:authUser';
const AUTH_TOKEN_KEY = 'click2buy:accessToken';

export const authStorage = {
  save(user: User, token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    // Save token to cookie for SSE access
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; samesite=strict`;
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_USER_KEY);
    // Clear token cookie
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
    // Try cookie first for SSE, fallback to localStorage
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_TOKEN_KEY}=`));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    return localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
  },
};

