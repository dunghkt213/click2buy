/**
 * RegisterPage - Trang đăng ký
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthSuccessPayload } from '../../../apis/auth';
import { RegisterForm } from '../../../components/auth/RegisterForm';
import { useAppContext } from '../../../providers/AppProvider';

export default function RegisterPage() {
  const navigate = useNavigate();
  const app = useAppContext();

  useEffect(() => {
    // Nếu đã đăng nhập, redirect về trang chủ
    if (app.isLoggedIn) {
      navigate('/feed');
    }
  }, [app.isLoggedIn, navigate]);

  const handleSuccess = (payload: AuthSuccessPayload) => {
    app.handleRegisterSuccess(payload);
    navigate('/feed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng ký</h1>
        <RegisterForm 
          onSuccess={handleSuccess}
          onClose={() => navigate('/')}
          onSwitchToLogin={() => navigate('/login')}
        />
      </div>
    </div>
  );
}

