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

