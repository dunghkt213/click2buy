import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authStorage } from '../../apis/auth';
import { userApi, normalizeUser } from '../../apis/user';
/**
 * Component để xử lý OAuth callback từ backend
 * Backend redirect về: /auth/callback?token={JWT_TOKEN}
 */
export function AuthCallback({ onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(null);
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
                const tempUser = {
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
                }
                catch (apiError) {
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
            }
            catch (err) {
                console.error('Failed to process OAuth callback:', err);
                setError('Không thể xử lý token. Vui lòng thử lại.');
                setIsProcessing(false);
            }
        };
        processAuthCallback();
    }, [onSuccess]);
    if (isProcessing) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang x\u1EED l\u00FD \u0111\u0103ng nh\u1EADp..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-red-500 mb-4", children: error }), _jsx("button", { onClick: () => window.location.href = '/', className: "px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700", children: "V\u1EC1 trang ch\u1EE7" })] }) }));
    }
    return null;
}
