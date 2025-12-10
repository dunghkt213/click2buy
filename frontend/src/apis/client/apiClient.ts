import { authApi, authStorage } from '../auth/authApi';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}
// Lock để tránh multiple refresh calls đồng thời
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh access token và trả về token mới
 * Có thể được gọi từ bên ngoài để refresh token thủ công
 */
async function refreshAccessToken(): Promise<string | null> {
  // Nếu đang refresh, đợi promise hiện tại
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await authApi.refresh();
      const newToken = response.accessToken;
      
      // Update token trong storage
      const user = authStorage.getUser();
      if (user && newToken) {
        authStorage.save(user, newToken);
      }
      
      return newToken;
    } catch (error) {
      // Refresh failed, clear auth
      authStorage.clear();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Tạo request với authentication header tự động và auto-refresh token
 */
async function request<T>(
  path: string,
  init?: RequestInit & { requireAuth?: boolean; retryCount?: number }
): Promise<T> {
  const retryCount = init?.retryCount ?? 0;
  const maxRetries = 1; // Chỉ retry 1 lần sau khi refresh

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };

  // Thêm authorization header nếu cần
  if (init?.requireAuth !== false) {
    const token = authStorage.getToken();
    if (token) {
      (headers as Record<string, string>)['authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...init,
  });

  let payload: any = null;
  try {
    const text = await response.text();
    if (text) {
      payload = JSON.parse(text);
    }
  } catch {
    // ignore JSON parse errors, will handle below
  }

  // Nếu gặp 401 và requireAuth, thử refresh token và retry
  if (response.status === 401 && init?.requireAuth !== false && retryCount < maxRetries) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry request với token mới
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      };
      (retryHeaders as Record<string, string>)['authorization'] = `Bearer ${newToken}`;

      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        headers: retryHeaders,
        ...init,
      });

      let retryPayload: any = null;
      try {
        const text = await retryResponse.text();
        if (text) {
          retryPayload = JSON.parse(text);
        }
      } catch {
        // ignore JSON parse errors
      }

      if (!retryResponse.ok) {
        const message =
          retryPayload?.message ||
          retryPayload?.error ||
          retryPayload?.data?.message ||
          `Request failed with status ${retryResponse.status}`;
        const error: ApiError = {
          message,
          status: retryResponse.status,
          data: retryPayload,
        };
        throw error;
      }

      return (retryPayload?.data ?? retryPayload) as T;
    } else {
      // Refresh failed, throw error
      const message =
        payload?.message ||
        payload?.error ||
        payload?.data?.message ||
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      const error: ApiError = {
        message,
        status: response.status,
        data: payload,
      };
      throw error;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      `Request failed with status ${response.status}`;
    const error: ApiError = {
      message,
      status: response.status,
      data: payload,
    };
    throw error;
  }

  return (payload?.data ?? payload) as T;
}

/**
 * Request với FormData (cho file upload) với auto-refresh token
 * 
 * Lưu ý: FormData không thể reuse, nên cần tạo lại khi retry
 * Do đó, function này nhận một factory function để tạo FormData
 */
async function requestFormData<T>(
  path: string,
  formDataFactory: () => FormData,
  requireAuth: boolean = true,
  retryCount: number = 0
): Promise<T> {
  const maxRetries = 1;
  const formData = formDataFactory();
  const headers: HeadersInit = {};

  if (requireAuth) {
    const token = authStorage.getToken();
    if (token) {
      (headers as Record<string, string>)['authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });

  let payload: any = null;
  try {
    const text = await response.text();
    if (text) {
      payload = JSON.parse(text);
    }
  } catch {
    // ignore JSON parse errors
  }

  // Nếu gặp 401 và requireAuth, thử refresh token và retry
  if (response.status === 401 && requireAuth && retryCount < maxRetries) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Tạo lại FormData cho retry (FormData không thể reuse)
      const retryFormData = formDataFactory();
      const retryHeaders: HeadersInit = {
        'authorization': `Bearer ${newToken}`,
      };

      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: retryHeaders,
        body: retryFormData,
      });

      let retryPayload: any = null;
      try {
        const text = await retryResponse.text();
        if (text) {
          retryPayload = JSON.parse(text);
        }
      } catch {
        // ignore JSON parse errors
      }

      if (!retryResponse.ok) {
        const message =
          retryPayload?.message ||
          retryPayload?.error ||
          retryPayload?.data?.message ||
          `Request failed with status ${retryResponse.status}`;
        const error: ApiError = {
          message,
          status: retryResponse.status,
          data: retryPayload,
        };
        throw error;
      }

      return (retryPayload?.data ?? retryPayload) as T;
    } else {
      // Refresh failed, throw error
      const message =
        payload?.message ||
        payload?.error ||
        payload?.data?.message ||
        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      const error: ApiError = {
        message,
        status: response.status,
        data: payload,
      };
      throw error;
    }
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      `Request failed with status ${response.status}`;
    const error: ApiError = {
      message,
      status: response.status,
      data: payload,
    };
    throw error;
  }

  return (payload?.data ?? payload) as T;
}

export { API_BASE_URL, request, requestFormData, refreshAccessToken };

