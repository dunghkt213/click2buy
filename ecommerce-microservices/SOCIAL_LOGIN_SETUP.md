# Hướng Dẫn Cài Đặt Social Login (OAuth2 Google, Facebook) và SMS OTP

## 1. Cài Đặt Dependencies

### API Gateway
```bash
cd ecommerce-microservices/api-gateway
npm install passport @nestjs/passport passport-google-oauth20 passport-facebook
npm install -D @types/passport-google-oauth20 @types/passport-facebook
```

### Auth Service
```bash
cd ecommerce-microservices/auth-service
# Không cần thêm dependencies mới (đã có sẵn)
# Nếu muốn dùng Twilio cho SMS thật:
# npm install twilio
```

### User Service
```bash
cd ecommerce-microservices/user-service
# Không cần thêm dependencies mới
```

---

## 2. Cấu Hình Environment Variables

### API Gateway (.env)
```env
# Frontend URL (for OAuth redirect)
FRONTEND_URL="http://localhost:5173"

# Google OAuth2
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Facebook OAuth2
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"
FACEBOOK_CALLBACK_URL="http://localhost:3000/auth/facebook/callback"
```

### Auth Service (.env)
```env
# JWT Secrets
ACCESS_SECRET="your_access_token_secret"
ACCESS_EXPIRES_IN="15m"
REFRESH_SECRET="your_refresh_token_secret"
REFRESH_EXPIRES_IN="30d"

# SMS OTP (Twilio - Optional)
# TWILIO_ACCOUNT_SID="your_twilio_account_sid"
# TWILIO_AUTH_TOKEN="your_twilio_auth_token"
# TWILIO_PHONE_NUMBER="+1234567890"
```

---

## 3. Lấy Credentials

### Google OAuth2
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. Thêm **Authorized redirect URIs**: `http://localhost:3000/auth/google/callback`
7. Copy **Client ID** và **Client Secret**

### Facebook OAuth2
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo App mới (chọn **Consumer**)
3. Vào **Settings** → **Basic** để lấy **App ID** và **App Secret**
4. Vào **Facebook Login** → **Settings**
5. Thêm **Valid OAuth Redirect URIs**: `http://localhost:3000/auth/facebook/callback`

---

## 4. API Endpoints

### Social Login

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/auth/google` | Redirect đến Google OAuth |
| GET | `/auth/google/callback` | Google callback (tự động) |
| GET | `/auth/facebook` | Redirect đến Facebook OAuth |
| GET | `/auth/facebook/callback` | Facebook callback (tự động) |

### SMS OTP Login

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/auth/login-sms` | `{ "phone": "+84123456789" }` | Gửi OTP |
| POST | `/auth/verify-sms` | `{ "phone": "+84123456789", "otp": "123456" }` | Xác thực OTP |

---

## 5. Flow Hoạt Động

### Social Login Flow
```
1. User click "Login with Google/Facebook"
2. Frontend redirect đến: GET /auth/google hoặc /auth/facebook
3. API Gateway redirect đến OAuth provider
4. User đăng nhập và authorize
5. Provider redirect về callback URL
6. API Gateway gửi Kafka message 'auth.social-login'
7. Auth Service gọi User Service để findOrCreate user
8. Auth Service generate JWT tokens
9. API Gateway set cookie và redirect về frontend với token
```

### SMS OTP Flow
```
1. User nhập số điện thoại
2. Frontend gọi: POST /auth/login-sms { phone }
3. Auth Service generate OTP và gửi SMS (mock trong dev)
4. User nhập OTP
5. Frontend gọi: POST /auth/verify-sms { phone, otp }
6. Auth Service verify OTP và gọi User Service findOrCreate
7. Auth Service generate JWT tokens
8. API Gateway set cookie và trả về tokens
```

---

## 6. User Schema Updates

User schema đã được cập nhật với các trường mới:

```typescript
// Enum provider đăng nhập
enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  PHONE = 'phone',
}

// Các trường mới trong User schema
{
  provider: AuthProvider,  // Loại đăng nhập
  googleId?: string,       // Google user ID
  facebookId?: string,     // Facebook user ID
  socialId?: string,       // Generic social ID
}
```

---

## 7. Kafka Topics Mới

| Topic | Producer | Consumer | Mô tả |
|-------|----------|----------|-------|
| `auth.social-login` | API Gateway | Auth Service | Xử lý social login |
| `auth.send-otp` | API Gateway | Auth Service | Gửi OTP |
| `auth.verify-otp` | API Gateway | Auth Service | Xác thực OTP |
| `user.findOrCreateSocial` | Auth Service | User Service | Tìm/tạo user social |
| `user.findOrCreateByPhone` | Auth Service | User Service | Tìm/tạo user phone |

---

## 8. Testing

### Test Google Login
```bash
# Mở browser và truy cập:
http://localhost:3000/auth/google
```

### Test Facebook Login
```bash
# Mở browser và truy cập:
http://localhost:3000/auth/facebook
```

### Test SMS OTP (Development Mode)
```bash
# Gửi OTP
curl -X POST http://localhost:3000/auth/login-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84123456789"}'

# Response sẽ chứa OTP trong dev mode:
# { "success": true, "message": "OTP sent successfully", "otp": "123456" }

# Verify OTP
curl -X POST http://localhost:3000/auth/verify-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+84123456789", "otp": "123456"}'
```

---

## 9. Production Considerations

1. **SMS Service**: Thay mock SMS bằng Twilio hoặc service thật
2. **OTP Storage**: Dùng Redis thay vì in-memory Map
3. **HTTPS**: Bật `secure: true` cho cookies
4. **Rate Limiting**: Thêm rate limit cho OTP endpoints
5. **Logging**: Thêm logging cho audit trail
