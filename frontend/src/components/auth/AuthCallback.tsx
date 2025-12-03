import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authStorage } from '../../apis/auth';
import { userApi, normalizeUser } from '../../apis/user';
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
    const processAuthCallback = async () => {
      // Parse URL params manually (không dùng react-router)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setError('Không tìm thấy token. Vui lòng thử lại.');
        setIsProcessing(false);
        return;
      }

      try {
        // Lưu token tạm thời để có thể gọi API
        authStorage.clear(); // Clear old data
        
        // Decode JWT để lấy user ID tạm thời
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub || payload.id || '';
        
        if (!userId) {
          throw new Error('Không tìm thấy user ID trong token');
        }

        // Lưu token trước để có thể gọi API
        const tempUser: User = {
          id: userId,
          name: payload.name || payload.username || payload.email || 'Người dùng',
          email: payload.email || '',
          avatar: payload.avatar,
          membershipLevel: 'Bronze',
          points: 0,
          role: payload.role,
        };
        authStorage.save(tempUser, token);

        // Gọi API để lấy đầy đủ thông tin user (bao gồm role)
        try {
          const backendUser = await userApi.findOne(userId);
          const fullUserInfo = normalizeUser(backendUser);
          
          // Cập nhật lại với thông tin đầy đủ
          authStorage.save(fullUserInfo, token);
          onSuccess(fullUserInfo, token);
        } catch (apiError) {
          // Nếu không gọi được API, dùng thông tin từ JWT
          console.warn('Failed to fetch user info from API, using JWT payload:', apiError);
          authStorage.save(tempUser, token);
          onSuccess(tempUser, token);
        }
        
        toast.success('Đăng nhập thành công!');
        
        // Clear URL params và redirect về trang chủ
        window.history.replaceState({}, '', '/');
        
        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (err) {
        console.error('Failed to process OAuth callback:', err);
        setError('Không thể xử lý token. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    };

    processAuthCallback();
  }, [onSuccess]);

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

