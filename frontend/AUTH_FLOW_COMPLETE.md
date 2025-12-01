# Authentication Flow - Hoàn thiện

## Tổng quan

Tài liệu này mô tả flow đăng nhập hoàn chỉnh cho 3 phương thức:
1. **Google OAuth**
2. **Facebook OAuth**  
3. **SMS OTP**

## 1. Google/Facebook OAuth Flow

### Frontend → Backend
1. User click nút "Google" hoặc "Facebook" trong `LoginForm.tsx` hoặc `RegisterForm.tsx`
2. Frontend redirect đến: `http://localhost:3000/auth/google` hoặc `/auth/facebook`
3. Backend (`AuthGateway`) sử dụng Passport guards để redirect đến OAuth provider

### Backend → OAuth Provider
4. Backend redirect user đến Google/Facebook OAuth page
5. User xác thực và cho phép
6. OAuth provider redirect về: `http://localhost:3000/auth/google/callback` hoặc `/auth/facebook/callback`

### Backend xử lý callback
7. `AuthGateway.googleAuthCallback()` hoặc `facebookAuthCallback()` nhận user profile từ Passport
8. Gửi message `auth.social-login` đến `auth-service` qua Kafka
9. `auth-service` gọi `user-service` để tìm hoặc tạo user
10. Tạo access token và refresh token
11. Redirect về frontend: `http://localhost:5173/auth/callback?token={JWT_TOKEN}`

### Frontend xử lý callback
12. `App.tsx` detect URL có `token` parameter → hiển thị `AuthCallback` component
13. `AuthCallback.tsx`:
    - Parse token từ URL
    - Decode JWT để lấy user ID tạm thời
    - Lưu token vào localStorage
    - **Gọi API `/users/{id}` để lấy đầy đủ thông tin user (bao gồm role)**
    - Cập nhật user state với thông tin đầy đủ
    - Gọi `onSuccess` callback
14. `App.tsx` reload trang để cập nhật UI

## 2. SMS OTP Flow

### Gửi OTP
1. User nhập số điện thoại trong `LoginForm.tsx` (tab SMS OTP)
2. Click "Gửi mã OTP"
3. Frontend gọi `authApi.sendOtp({ phone })` → `POST /auth/login-sms`
4. Backend (`AuthGateway.sendOtp()`) gửi message `auth.send-otp` đến `auth-service`
5. `auth-service` generate OTP và lưu vào Redis (hoặc gửi SMS thật)
6. Trong dev mode, OTP được trả về trong response để test
7. Frontend hiển thị form nhập OTP

### Xác thực OTP
8. User nhập mã OTP
9. Click "Xác thực OTP"
10. Frontend gọi `authApi.verifyOtp({ phone, otp })` → `POST /auth/verify-sms`
11. Backend (`AuthGateway.verifyOtp()`) gửi message `auth.verify-otp` đến `auth-service`
12. `auth-service` verify OTP và tìm/tạo user
13. Tạo access token và refresh token
14. Trả về `{ user, accessToken }`
15. Frontend map response và gọi `onSuccess` callback
16. `App.tsx` fetch đầy đủ user info từ API và reload trang

## 3. API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập bằng username/password
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Đăng xuất
- `GET /auth/google` - Bắt đầu Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback (backend xử lý)
- `GET /auth/facebook` - Bắt đầu Facebook OAuth flow
- `GET /auth/facebook/callback` - Facebook OAuth callback (backend xử lý)
- `POST /auth/login-sms` - Gửi OTP đến số điện thoại
- `POST /auth/verify-sms` - Xác thực OTP và đăng nhập

### User
- `GET /users/{id}` - Lấy thông tin user (cần authentication)

## 4. Các cải tiến đã thực hiện

### AuthCallback.tsx
- ✅ Sửa lỗi `searchParams` không được định nghĩa
- ✅ Gọi API `/users/{id}` để lấy đầy đủ thông tin user (bao gồm role)
- ✅ Fallback về JWT payload nếu không gọi được API
- ✅ Clear URL params sau khi xử lý

### authApi.ts
- ✅ Sửa `verifyOtp` để map đúng response format từ backend
- ✅ Backend trả về `{ message, user, accessToken }` → map về `{ user, accessToken }`

### App.tsx
- ✅ `handleAuthCallbackSuccess` fetch đầy đủ user info từ API
- ✅ Tự động set `hasStore = true` nếu role là `seller`
- ✅ Reload trang sau khi đăng nhập thành công

## 5. Environment Variables cần thiết

### Backend (.env trong api-gateway)
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 6. Lưu ý

1. **OAuth Strategies**: Nếu không có `GOOGLE_CLIENT_ID` hoặc `FACEBOOK_APP_ID`, API Gateway sẽ không khởi động được. Đã sửa `AuthModule` để chỉ load strategies khi có config (nhưng user đã reject thay đổi này).

2. **Token Storage**: Access token được lưu trong `localStorage`, refresh token được lưu trong `httpOnly` cookie bởi backend.

3. **User Role**: Sau khi đăng nhập, frontend sẽ tự động fetch user info từ API để lấy role. Nếu role là `seller`, tự động set `hasStore = true`.

4. **Error Handling**: Tất cả các API calls đều có error handling và hiển thị toast notification.

