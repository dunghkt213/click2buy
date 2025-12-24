import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RegisterPage - Trang đăng ký
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const handleSuccess = (payload) => {
        app.handleRegisterSuccess(payload);
        navigate('/feed');
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 px-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-lg shadow-lg p-8", children: [_jsx("h1", { className: "text-2xl font-bold text-center mb-6", children: "\u0110\u0103ng k\u00FD" }), _jsx(RegisterForm, { onSuccess: handleSuccess, onClose: () => navigate('/'), onSwitchToLogin: () => navigate('/login') })] }) }));
}
