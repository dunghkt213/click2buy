import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authApi, mapAuthResponse } from '../../apis/auth';
import { API_BASE_URL } from '../../apis/client/baseUrl';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
export function LoginForm({ onSuccess, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loginMethod, setLoginMethod] = useState('password');
    const [otpSent, setOtpSent] = useState(false);
    const [otpPhone, setOtpPhone] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors, isSubmitting: isSubmittingOtp } } = useForm();
    const onSubmit = async (data) => {
        try {
            const response = await authApi.login({
                username: data.username.trim(),
                password: data.password,
            });
            const payload = mapAuthResponse(response);
            toast.success('Đăng nhập thành công!');
            onSuccess(payload);
            onClose();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
            toast.error(message);
        }
    };
    const handleSocialLogin = (provider) => {
        // Redirect đến backend OAuth endpoint
        // Backend sẽ tự động redirect đến Google/Facebook OAuth page
        const url = `${API_BASE_URL}/auth/${provider}`;
        console.log(`Redirecting to ${provider} OAuth:`, url);
        window.location.href = url;
    };
    const handleSendOtp = async (data) => {
        try {
            const response = await authApi.sendOtp({ phone: data.phone });
            setOtpSent(true);
            setOtpPhone(data.phone);
            // Trong dev mode, OTP sẽ có trong response
            if (response.otp) {
                console.log('🔐 OTP Code (Dev Mode):', response.otp);
                toast.info(`OTP đã được gửi. Mã OTP (Dev): ${response.otp}`, {
                    duration: 10000,
                });
            }
            else {
                toast.success('OTP đã được gửi đến số điện thoại của bạn');
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể gửi OTP. Vui lòng thử lại.';
            toast.error(message);
        }
    };
    const handleVerifyOtp = async (data) => {
        try {
            const response = await authApi.verifyOtp({
                phone: data.phone,
                otp: data.otp,
            });
            const payload = mapAuthResponse(response);
            toast.success('Đăng nhập thành công!');
            onSuccess(payload);
            onClose();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Mã OTP không đúng. Vui lòng thử lại.';
            toast.error(message);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-center mb-2", children: "Xin ch\u00E0o," }), _jsx("p", { className: "text-center text-muted-foreground", children: "\u0110\u0103ng nh\u1EADp \u0111\u1EC3 ti\u1EBFp t\u1EE5c" })] }), _jsxs(Tabs, { value: loginMethod, onValueChange: (v) => setLoginMethod(v), className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "password", children: "M\u1EADt kh\u1EA9u" }), _jsx(TabsTrigger, { value: "otp", children: "SMS OTP" })] }), _jsx(TabsContent, { value: "password", className: "mt-4", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "T\u00EAn \u0111\u0103ng nh\u1EADp / Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "username", type: "text", placeholder: "Nh\u1EADp t\u00EAn \u0111\u0103ng nh\u1EADp ho\u1EB7c email", className: "pl-10", ...register('username', {
                                                        required: 'Vui lòng nhập tên đăng nhập hoặc email',
                                                        minLength: {
                                                            value: 3,
                                                            message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                                                        }
                                                    }) })] }), errors.username && (_jsx("p", { className: "text-sm text-red-500", children: errors.username.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u", className: "pl-10 pr-10", ...register('password', {
                                                        required: 'Vui lòng nhập mật khẩu',
                                                        minLength: {
                                                            value: 6,
                                                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                                        }
                                                    }) }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "remember", checked: rememberMe, onCheckedChange: (checked) => setRememberMe(checked) }), _jsx("label", { htmlFor: "remember", className: "text-sm cursor-pointer select-none", children: "Ghi nh\u1EDB t\u00F4i" })] }), _jsx("button", { type: "button", className: "text-sm text-orange-600 hover:text-orange-700", onClick: () => toast.info('Tính năng quên mật khẩu đang được phát triển'), children: "Qu\u00EAn m\u1EADt kh\u1EA9u?" })] }), _jsx(Button, { type: "submit", className: "w-full bg-orange-600 hover:bg-orange-700", disabled: isSubmitting, children: isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập' })] }) }), _jsx(TabsContent, { value: "otp", className: "mt-4", children: !otpSent ? (_jsxs("form", { onSubmit: handleSubmitOtp((data) => handleSendOtp({ phone: data.phone })), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "otpPhone", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "otpPhone", type: "tel", placeholder: "+84987654321", className: "pl-10", ...registerOtp('phone', {
                                                        required: 'Vui lòng nhập số điện thoại',
                                                        pattern: {
                                                            value: /^\+?[0-9]{10,15}$/,
                                                            message: 'Số điện thoại không hợp lệ'
                                                        }
                                                    }) })] }), otpErrors.phone && (_jsx("p", { className: "text-sm text-red-500", children: otpErrors.phone.message }))] }), _jsx(Button, { type: "submit", className: "w-full bg-orange-600 hover:bg-orange-700", disabled: isSubmittingOtp, children: isSubmittingOtp ? 'Đang gửi...' : 'Gửi mã OTP' })] })) : (_jsxs("form", { onSubmit: handleSubmitOtp(handleVerifyOtp), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "otpPhoneDisplay", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsx(Input, { id: "otpPhoneDisplay", type: "tel", value: otpPhone, disabled: true, className: "bg-muted" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "otpCode", children: "M\u00E3 OTP" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "otpCode", type: "text", placeholder: "Nh\u1EADp m\u00E3 OTP 6 s\u1ED1", className: "pl-10", maxLength: 6, ...registerOtp('otp', {
                                                        required: 'Vui lòng nhập mã OTP',
                                                        pattern: {
                                                            value: /^[0-9]{6}$/,
                                                            message: 'Mã OTP phải là 6 chữ số'
                                                        }
                                                    }) })] }), otpErrors.otp && (_jsx("p", { className: "text-sm text-red-500", children: otpErrors.otp.message })), _jsx("input", { type: "hidden", ...registerOtp('phone'), value: otpPhone })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "outline", className: "flex-1", onClick: () => {
                                                setOtpSent(false);
                                                setOtpPhone('');
                                            }, children: "Quay l\u1EA1i" }), _jsx(Button, { type: "submit", className: "flex-1 bg-orange-600 hover:bg-orange-700", disabled: isSubmittingOtp, children: isSubmittingOtp ? 'Đang xác thực...' : 'Xác thực OTP' })] })] })) })] }), _jsxs("div", { className: "relative", children: [_jsx(Separator, {}), _jsx("span", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground", children: "HO\u1EB6C" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => handleSocialLogin('google'), children: [_jsxs("svg", { className: "mr-2 h-4 w-4", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" }), _jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }), _jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }), _jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })] }), "Google"] }), _jsxs(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => handleSocialLogin('facebook'), children: [_jsx("svg", { className: "mr-2 h-4 w-4", fill: "#1877F2", viewBox: "0 0 24 24", children: _jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }), "Facebook"] })] }), _jsxs("p", { className: "text-center text-xs text-muted-foreground", children: ["B\u1EB1ng vi\u1EC7c \u0111\u0103ng nh\u1EADp, b\u1EA1n \u0111\u00E3 \u0111\u1ED3ng \u00FD v\u1EDBi", ' ', _jsx("button", { className: "text-orange-600 hover:underline", children: "\u0110i\u1EC1u kho\u1EA3n d\u1ECBch v\u1EE5" }), ' ', "&", ' ', _jsx("button", { className: "text-orange-600 hover:underline", children: "Ch\u00EDnh s\u00E1ch b\u1EA3o m\u1EADt" })] })] }));
}
