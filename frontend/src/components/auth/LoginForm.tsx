import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { authApi, mapAuthResponse, AuthSuccessPayload } from '../../apis/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSuccess: (payload: AuthSuccessPayload) => void;
  onClose: () => void;
}

interface OtpFormData {
  phone: string;
  otp: string;
}

export function LoginForm({ onSuccess, onClose }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const { register: registerOtp, handleSubmit: handleSubmitOtp, formState: { errors: otpErrors, isSubmitting: isSubmittingOtp } } = useForm<OtpFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login({
        username: data.username.trim(),
        password: data.password,
      });

      const payload = mapAuthResponse(response);
      toast.success('Đăng nhập thành công!');
      onSuccess(payload);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Redirect đến backend OAuth endpoint
    // Backend sẽ tự động redirect đến Google/Facebook OAuth page
    const url = `${API_BASE_URL}/auth/${provider}`;
    console.log(`Redirecting to ${provider} OAuth:`, url);
    window.location.href = url;
  };

  const handleSendOtp = async (data: { phone: string }) => {
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
      } else {
        toast.success('OTP đã được gửi đến số điện thoại của bạn');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi OTP. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const handleVerifyOtp = async (data: OtpFormData) => {
    try {
      const response = await authApi.verifyOtp({
        phone: data.phone,
        otp: data.otp,
      });

      const payload = mapAuthResponse(response);
      toast.success('Đăng nhập thành công!');
      onSuccess(payload);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mã OTP không đúng. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-center mb-2">Xin chào,</h3>
        <p className="text-center text-muted-foreground">Đăng nhập để tiếp tục</p>
      </div>

      <Tabs value={loginMethod} onValueChange={(v: string) => setLoginMethod(v as 'password' | 'otp')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          <TabsTrigger value="otp">SMS OTP</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập / Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập hoặc email"
              className="pl-10"
              {...register('username', { 
                required: 'Vui lòng nhập tên đăng nhập hoặc email',
                minLength: {
                  value: 3,
                  message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                }
              })}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              className="pl-10 pr-10"
              {...register('password', { 
                required: 'Vui lòng nhập mật khẩu',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked: boolean) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm cursor-pointer select-none"
            >
              Ghi nhớ tôi
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-orange-600 hover:text-orange-700"
            onClick={() => toast.info('Tính năng quên mật khẩu đang được phát triển')}
          >
            Quên mật khẩu?
          </button>
        </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="mt-4">
          {!otpSent ? (
            <form onSubmit={handleSubmitOtp((data) => handleSendOtp({ phone: data.phone }))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpPhone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otpPhone"
                    type="tel"
                    placeholder="+84987654321"
                    className="pl-10"
                    {...registerOtp('phone', { 
                      required: 'Vui lòng nhập số điện thoại',
                      pattern: {
                        value: /^\+?[0-9]{10,15}$/,
                        message: 'Số điện thoại không hợp lệ'
                      }
                    })}
                  />
                </div>
                {otpErrors.phone && (
                  <p className="text-sm text-red-500">{otpErrors.phone.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isSubmittingOtp}
              >
                {isSubmittingOtp ? 'Đang gửi...' : 'Gửi mã OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitOtp(handleVerifyOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpPhoneDisplay">Số điện thoại</Label>
                <Input
                  id="otpPhoneDisplay"
                  type="tel"
                  value={otpPhone}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otpCode">Mã OTP</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="Nhập mã OTP 6 số"
                    className="pl-10"
                    maxLength={6}
                    {...registerOtp('otp', { 
                      required: 'Vui lòng nhập mã OTP',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Mã OTP phải là 6 chữ số'
                      }
                    })}
                  />
                </div>
                {otpErrors.otp && (
                  <p className="text-sm text-red-500">{otpErrors.otp.message}</p>
                )}
                <input type="hidden" {...registerOtp('phone')} value={otpPhone} />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpPhone('');
                  }}
                >
                  Quay lại
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={isSubmittingOtp}
                >
                  {isSubmittingOtp ? 'Đang xác thực...' : 'Xác thực OTP'}
                </Button>
              </div>
            </form>
          )}
        </TabsContent>
      </Tabs>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          HOẶC
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('google')}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={() => handleSocialLogin('facebook')}
        >
          <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Bằng việc đăng nhập, bạn đã đồng ý với{' '}
        <button className="text-orange-600 hover:underline">
          Điều khoản dịch vụ
        </button>{' '}
        &{' '}
        <button className="text-orange-600 hover:underline">
          Chính sách bảo mật
        </button>
      </p>
    </div>
  );
}
