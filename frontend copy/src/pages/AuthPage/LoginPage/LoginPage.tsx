/**
 * LoginPage - Trang đăng nhập
 */

import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../../components/auth/LoginForm';
import { AuthSuccessPayload } from '../../../apis/auth';
import { useAppContext } from '../../../providers/AppProvider';
import { useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const app = useAppContext();

  useEffect(() => {
    // Nếu đã đăng nhập, redirect về trang chủ
    if (app.isLoggedIn) {
      navigate('/feed');
    }
  }, [app.isLoggedIn, navigate]);

  const handleSuccess = (payload: AuthSuccessPayload) => {
    app.handleLoginSuccess(payload);
    navigate('/feed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
        <LoginForm 
          onSuccess={handleSuccess}
          onClose={() => navigate('/feed')}
        />
      </div>
    </div>
  );
}

