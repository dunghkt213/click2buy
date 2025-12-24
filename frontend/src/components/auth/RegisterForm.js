import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authApi, mapAuthResponse } from '../../apis/auth';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
export function RegisterForm({ onSuccess, onClose, onSwitchToLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const password = watch('password');
    const onSubmit = async (data) => {
        if (!agreeToTerms) {
            toast.error('Vui lòng đồng ý với điều khoản dịch vụ');
            return;
        }
        try {
            const response = await authApi.register({
                username: data.username.trim(),
                email: data.email.trim(),
                phone: data.phone,
                password: data.password,
                role: 'customer',
            });
            const payload = mapAuthResponse(response);
            toast.success('Đăng ký thành công! Chào mừng bạn đến với ShopMart.');
            onSuccess(payload);
            onClose();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.';
            toast.error(message);
        }
    };
    const handleSocialRegister = (provider) => {
        // Redirect đến backend OAuth endpoint
        // Backend sẽ tự động redirect đến Google/Facebook OAuth page
        const url = `${API_BASE_URL}/auth/${provider}`;
        console.log(`Redirecting to ${provider} OAuth:`, url);
        window.location.href = url;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-center mb-2", children: "T\u1EA1o t\u00E0i kho\u1EA3n m\u1EDBi" }), _jsx("p", { className: "text-center text-muted-foreground", children: "\u0110\u0103ng k\u00FD \u0111\u1EC3 tr\u1EA3i nghi\u1EC7m mua s\u1EAFm tuy\u1EC7t v\u1EDDi" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "T\u00EAn \u0111\u0103ng nh\u1EADp" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "username", type: "text", placeholder: "Nh\u1EADp t\u00EAn \u0111\u0103ng nh\u1EADp", className: "pl-10", ...register('username', {
                                            required: 'Vui lòng nhập tên đăng nhập',
                                            minLength: {
                                                value: 3,
                                                message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                                            }
                                        }) })] }), errors.username && (_jsx("p", { className: "text-sm text-red-500", children: errors.username.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "registerEmail", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "registerEmail", type: "email", placeholder: "Nh\u1EADp \u0111\u1ECBa ch\u1EC9 email", className: "pl-10", ...register('email', {
                                            required: 'Vui lòng nhập email',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Email không hợp lệ'
                                            }
                                        }) })] }), errors.email && (_jsx("p", { className: "text-sm text-red-500", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "phone", type: "tel", placeholder: "Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i", className: "pl-10", ...register('phone', {
                                            required: 'Vui lòng nhập số điện thoại',
                                            pattern: {
                                                value: /^[0-9]{10,11}$/,
                                                message: 'Số điện thoại phải có 10-11 chữ số'
                                            }
                                        }) })] }), errors.phone && (_jsx("p", { className: "text-sm text-red-500", children: errors.phone.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "registerPassword", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "registerPassword", type: showPassword ? 'text' : 'password', placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u", className: "pl-10 pr-10", ...register('password', {
                                            required: 'Vui lòng nhập mật khẩu',
                                            minLength: {
                                                value: 6,
                                                message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                message: 'Mật khẩu phải có chữ hoa, chữ thường và số'
                                            }
                                        }) }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "X\u00E1c nh\u1EADn m\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u", className: "pl-10 pr-10", ...register('confirmPassword', {
                                            required: 'Vui lòng xác nhận mật khẩu',
                                            validate: value => value === password || 'Mật khẩu không khớp'
                                        }) }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showConfirmPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors.confirmPassword && (_jsx("p", { className: "text-sm text-red-500", children: errors.confirmPassword.message }))] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Checkbox, { id: "agreeToTerms", checked: agreeToTerms, onCheckedChange: (checked) => setAgreeToTerms(checked), className: "mt-1" }), _jsxs("label", { htmlFor: "agreeToTerms", className: "text-sm cursor-pointer select-none", children: ["T\u00F4i \u0111\u1ED3ng \u00FD v\u1EDBi", ' ', _jsx("button", { type: "button", className: "text-orange-600 hover:underline", children: "\u0110i\u1EC1u kho\u1EA3n d\u1ECBch v\u1EE5" }), ' ', "v\u00E0", ' ', _jsx("button", { type: "button", className: "text-orange-600 hover:underline", children: "Ch\u00EDnh s\u00E1ch b\u1EA3o m\u1EADt" }), ' ', "c\u1EE7a ShopMart"] })] }), _jsx(Button, { type: "submit", className: "w-full bg-orange-600 hover:bg-orange-700", disabled: isSubmitting, children: isSubmitting ? 'Đang đăng ký...' : 'Đăng ký' })] }), _jsxs("div", { className: "relative", children: [_jsx(Separator, {}), _jsx("span", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground", children: "HO\u1EB6C" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => handleSocialRegister('google'), children: [_jsxs("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }), "Google"] }), _jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => handleSocialRegister('facebook'), children: [_jsx("svg", { className: "mr-2 h-4 w-4", fill: "#1877F2", viewBox: "0 0 24 24", children: _jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }), "Facebook"] })] }), _jsxs("p", { className: "text-center text-sm", children: ["\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n?", ' ', _jsx("button", { type: "button", onClick: onSwitchToLogin, className: "text-orange-600 hover:underline", children: "\u0110\u0103ng nh\u1EADp ngay" })] })] }));
}
