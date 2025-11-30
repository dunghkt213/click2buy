import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authStorage } from '../../lib/authApi';
import { User } from '../../types';

interface AuthCallbackProps {
  onSuccess: (user: User, token: string) => void;
}

/**
 * Component để xử lý OAuth callback từ backend
 * Backend redirect về: /auth/callback?token={JWT_TOKEN}
 */
export function AuthCallback({ onSuccess }: AuthCallbackProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL params manually (không dùng react-router)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setError('Không tìm thấy token. Vui lòng thử lại.');
      setIsProcessing(false);
      return;
    }

    // Lưu token vào localStorage
    // Backend đã trả về token, nhưng chúng ta cần decode để lấy user info
    // Hoặc gọi API để lấy user info
    try {
      // Lưu token tạm thời
      authStorage.clear(); // Clear old data
      
      // Decode JWT để lấy user info (basic approach)
      // Trong production, nên gọi API /auth/me để lấy user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.sub || payload.id || '',
        name: payload.name || payload.username || payload.email || 'Người dùng',
        email: payload.email || '',
        avatar: payload.avatar,
        membershipLevel: 'Bronze',
        points: 0,
      };

      authStorage.save(user, token);
      onSuccess(user, token);
      
      toast.success('Đăng nhập thành công!');
      
      // Redirect về trang chủ sau 1 giây
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('Failed to process OAuth callback:', err);
      setError('Không thể xử lý token. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  }, [searchParams, onSuccess]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang xử lý đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return null;
}

