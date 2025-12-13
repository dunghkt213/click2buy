# Hướng Dẫn Kết Nối API - Click2Buy E-commerce

## 📋 Tổng Quan

Tài liệu này mô tả cách kết nối frontend (React + Vite) với backend (NestJS Microservices qua API Gateway).

## 🏗️ Kiến Trúc Hệ Thống

```
Frontend (React/Vite) 
    ↓ HTTP Requests
API Gateway (Port 3000)
    ↓ Kafka Messages
Microservices (Auth, Product, Cart, Order, Payment, etc.)
    ↓
MongoDB, Redis, Kafka
```

## 🔧 Cấu Hình Frontend

### 1. API Base URL

**File:** `frontend/src/apis/client/apiClient.ts`

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
```

**Cấu hình:**
- Tạo file `.env` trong thư mục `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

- Hoặc set trong `vite.config.ts` nếu cần

### 2. CORS Configuration

**Backend:** `ecommerce-microservices/api-gateway/src/main.ts`

```typescript
app.enableCors({
    origin: ['http://localhost:5173'],  // Frontend dev port
    credentials: true,
});
```

**Lưu ý:** Đảm bảo frontend chạy trên port 5173 (hoặc cập nhật CORS config)

## 📡 API Endpoints Mapping

### 🔐 Authentication (`/auth`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `authApi.login()` | `/auth/login` | POST | ❌ |
| `authApi.register()` | `/auth/register` | POST | ❌ |
| `authApi.refresh()` | `/auth/refresh` | POST | ❌ (cookie) |
| `authApi.logout()` | `/auth/logout` | POST | ❌ (cookie) |
| `authApi.sendOtp()` | `/auth/login-sms` | POST | ❌ |
| `authApi.verifyOtp()` | `/auth/verify-sms` | POST | ❌ |
| Google OAuth | `/auth/google` | GET | ❌ |
| Google Callback | `/auth/google/callback` | GET | ❌ |
| Facebook OAuth | `/auth/facebook` | GET | ❌ |
| Facebook Callback | `/auth/facebook/callback` | GET | ❌ |

**Files:**
- Frontend: `frontend/src/apis/auth/authApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/auth.gateway.ts`

**Request/Response Format:**
```typescript
// Login Request
{
  username: string;
  password: string;
}

// Login Response
{
  message: string;
  user: BackendUser;
  accessToken: string;
}
```

**Lưu ý:**
- Refresh token được lưu trong HTTP-only cookie
- Access token được lưu trong localStorage (`click2buy:accessToken`)
- Auto-refresh token khi gặp 401

---

### 👤 User Management (`/users`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `userApi.create()` | `/users` | POST | ✅ |
| `userApi.findAll()` | `/users` | GET | ✅ |
| `userApi.findOne(id)` | `/users/:id` | GET | ✅ |
| `userApi.update(id, dto)` | `/users/:id` | PUT | ✅ |
| `userApi.deactivate(id)` | `/users/:id` | DELETE | ✅ |
| `userApi.updateRoleSeller()` | `/users/seller` | POST | ✅ |

**Files:**
- Frontend: `frontend/src/apis/user/userApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/user.gateway.ts`

---

### 🛍️ Products (`/products`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `productApi.getAll()` | `/products` | GET | ❌ |
| `productApi.getById(id)` | `/products/:id` | GET | ❌ |
| `productApi.search()` | `/products/search` | POST | ❌ |
| `productApi.create()` | `/products` | POST | ✅ |
| `productApi.update(id, dto)` | `/products/:id` | PATCH | ✅ |
| `productApi.remove(id)` | `/products/:id` | DELETE | ✅ |
| `productApi.getAllBySeller()` | `/products/seller` | GET | ✅ |
| `productApi.updateStock()` | `/products/:id/stock` | PATCH | ✅ |

**Files:**
- Frontend: `frontend/src/apis/product/productApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/product.gateway.ts`

**Query Parameters:**
```typescript
// GET /products
{
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;  // Default: 40 (đã cấu hình)
}
```

**Response Format:**
```typescript
// GET /products/:id
{
  _id: string;
  name: string;
  price: number;
  stock: number;  // Từ inventory-service
  reservedStock: number;
  // ... other fields
}
```

---

### 🛒 Cart (`/cart`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `cartApi.getAll()` | `/cart` | GET | ✅ |
| `cartApi.addItem(dto)` | `/cart` | POST | ✅ |
| `cartApi.updateItem(dto)` | `/cart/update` | PATCH | ✅ |
| `cartApi.updateQuantity(dto)` | `/cart/productQuantity` | PATCH | ✅ |
| `cartApi.removeItem(dto)` | `/cart/product` | DELETE | ✅ |
| `cartApi.createOrder(dto)` | `/cart/order` | POST | ✅ |

**Files:**
- Frontend: `frontend/src/apis/cart/cartApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/cart.gateway.ts`

**Request Format:**
```typescript
// Add to Cart
{
  productId: string;
  quantity: number;
  price: number;
  sellerId: string;
}

// Response: Cart grouped by seller
[
  {
    sellerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      product?: Product;  // Enriched từ product-service
    }>;
    total: number;
  }
]
```

---

### 📦 Orders (`/orders`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `orderApi.create(dto)` | `/orders` | POST | ✅ |
| `orderApi.getAllForSeller()` | `/orders/seller` | GET | ✅ |
| `orderApi.getAllForUser()` | `/orders/user` | GET | ✅ |
| Approve Order | `/orders/seller/orders/:orderId/confirm` | PATCH | ✅ |
| Reject Order | `/orders/seller/orders/:orderId/reject` | PATCH | ✅ |
| Complete Order | `/orders/:orderId/complete` | PATCH | ✅ |

**Files:**
- Frontend: `frontend/src/apis/order/orderApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/order.gateway.ts`

**Request Format:**
```typescript
// Create Order
{
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    sellerId: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  paymentMethod: string;
  shippingMethod?: string;
  note?: string;
}
```

---

### 💳 Payment (`/payment`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| Create Banking Payment | `/payment/create-banking` | POST | ✅ |
| PayOS Callback | `/payment/payos/callback` | POST | ❌ (webhook) |

**Files:**
- Frontend: `frontend/src/apis/payment/payment.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/payment.gateway.ts`

**WebSocket Events:**
- `QR_CREATED`: QR code đã được tạo
- `PAYMENT_SUCCESS`: Thanh toán thành công
- `QR_EXPIRED`: QR code hết hạn

**SSE Connection:**
- Frontend hook: `frontend/src/hooks/useSSE.ts`
- WebSocket Gateway: `ecommerce-microservices/api-gateway/src/gateways/payment-ws.gateway.ts`

---

### ⭐ Reviews (`/reviews`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `reviewApi.create(dto)` | `/reviews` | POST | ✅ |
| `reviewApi.findAll(query)` | `/reviews` | GET | ❌ |
| `reviewApi.findOne(id)` | `/reviews/:id` | GET | ❌ |
| `reviewApi.update(id, dto)` | `/reviews/:id` | PATCH | ✅ |
| `reviewApi.remove(id)` | `/reviews/:id` | DELETE | ✅ |

**Files:**
- Frontend: `frontend/src/apis/review/reviewApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/review.gateway.ts`

**Lưu ý:** Reviews có AI Guard để kiểm tra nội dung spam/toxicity

---

### 📸 Media (`/media`)

| Frontend API | Gateway Endpoint | Method | Auth Required |
|-------------|------------------|--------|---------------|
| `mediaApi.upload(file)` | `/media/upload` | POST | ✅ |

**Files:**
- Frontend: `frontend/src/apis/media/mediaApi.ts`
- Gateway: `ecommerce-microservices/api-gateway/src/gateways/media.gateway.ts`

**Request Format:**
- Content-Type: `multipart/form-data`
- Field name: `file`

**Response:**
```typescript
{
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}
```

---

## 🔑 Authentication Flow

### 1. Login Flow

```
Frontend → POST /auth/login
    ↓
API Gateway → Kafka: auth.login
    ↓
Auth Service → Validate credentials
    ↓
Response: { user, accessToken }
    ↓
Frontend: Save accessToken to localStorage
         Save refreshToken to HTTP-only cookie (backend)
```

### 2. Auto Token Refresh

**File:** `frontend/src/apis/client/apiClient.ts`

```typescript
// Khi gặp 401:
1. Gọi /auth/refresh (tự động lấy cookie)
2. Nhận accessToken mới
3. Retry request ban đầu với token mới
```

### 3. Request Headers

```typescript
// Tự động thêm vào mỗi request (nếu requireAuth !== false)
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## 🐛 Troubleshooting

### 1. CORS Errors

**Vấn đề:** Frontend không thể gọi API

**Giải pháp:**
- Kiểm tra CORS config trong `api-gateway/src/main.ts`
- Đảm bảo frontend URL đúng (http://localhost:5173)
- Kiểm tra `credentials: true` trong cả frontend và backend

### 2. 401 Unauthorized

**Vấn đề:** Token hết hạn hoặc không hợp lệ

**Giải pháp:**
- Kiểm tra token trong localStorage
- Kiểm tra refresh token trong cookie
- Xem console log để debug refresh flow

### 3. API Gateway không kết nối được Kafka

**Vấn đề:** Gateway không nhận được response từ microservices

**Giải pháp:**
- Kiểm tra Kafka đang chạy: `docker ps | grep kafka`
- Kiểm tra logs: `docker logs click2buy_api-gateway`
- Đảm bảo microservices đã subscribe đúng topics

### 4. Response Format Không Đúng

**Vấn đề:** Frontend nhận được format khác với mong đợi

**Giải pháp:**
- Kiểm tra mapper functions trong `frontend/src/apis/*/mapper.ts`
- Backend có thể trả về `{ data: [...] }` hoặc array trực tiếp
- Xem `apiClient.ts` line 163: `return (payload?.data ?? payload) as T;`

---

## 📝 Checklist Kết Nối API

### Frontend Setup
- [ ] Tạo file `.env` với `VITE_API_BASE_URL=http://localhost:3000`
- [ ] Kiểm tra `apiClient.ts` đang sử dụng đúng base URL
- [ ] Kiểm tra CORS config trong backend cho phép frontend origin

### Backend Setup
- [ ] API Gateway chạy trên port 3000
- [ ] Kafka đang chạy và kết nối được
- [ ] Tất cả microservices đã start và subscribe topics
- [ ] MongoDB và Redis đang chạy

### Testing
- [ ] Test login/register flow
- [ ] Test product listing với pagination
- [ ] Test cart operations
- [ ] Test order creation
- [ ] Test payment flow với WebSocket
- [ ] Test file upload

---

## 🔗 Tài Liệu Tham Khảo

- **API Gateway:** `ecommerce-microservices/api-gateway/src/gateways/`
- **Frontend APIs:** `frontend/src/apis/`
- **Auth Flow:** `frontend/AUTH_FLOW_COMPLETE.md`
- **Docker Compose:** `ecommerce-microservices/docker-compose.yml`

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser (F12)
2. API Gateway logs: `docker logs click2buy_api-gateway`
3. Microservice logs: `docker logs click2buy_<service-name>`
4. Network tab trong DevTools để xem request/response

