import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onClose: () => void;
}

export function LoginForm({ onSuccess, onClose }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = {
        id: '1',
        name: 'Nguyễn Văn A',
        email: data.email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      };
      
      toast.success('Đăng nhập thành công!');
      onSuccess(mockUser);
      onClose();
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Đăng nhập bằng ${provider} đang được phát triển`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-center mb-2">Xin chào,</h3>
        <p className="text-center text-muted-foreground">Đăng nhập để tiếp tục</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email / Số điện thoại</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              className="pl-10"
              {...register('email', { 
                required: 'Vui lòng nhập email hoặc số điện thoại',
                pattern: {
                  value: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|([0-9]{10,11})$/,
                  message: 'Email hoặc số điện thoại không hợp lệ'
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
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
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
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
          onClick={() => handleSocialLogin('Google')}
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
          onClick={() => handleSocialLogin('Facebook')}
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