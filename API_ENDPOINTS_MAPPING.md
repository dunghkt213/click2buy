# API Endpoints Mapping - Click2Buy

## 📍 Base URL
- **Development:** `http://localhost:3000`
- **Production:** (Cấu hình trong `.env`)

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
**Frontend:** `authApi.login(payload)`
```typescript
Request: {
  username: string;
  password: string;
}
Response: {
  message: string;
  user: BackendUser;
  accessToken: string;
}
// Refresh token được set trong HTTP-only cookie
```

### POST `/auth/register`
**Frontend:** `authApi.register(payload)`
```typescript
Request: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: string;
}
Response: {
  message: string;
  user: BackendUser;
  accessToken: string;
}
```

### POST `/auth/refresh`
**Frontend:** `authApi.refresh()`
```typescript
// Tự động lấy refresh token từ cookie
Response: {
  message: string;
  accessToken: string;
}
```

### POST `/auth/logout`
**Frontend:** `authApi.logout()`
```typescript
Response: {
  success: boolean;
  message: string;
}
```

### POST `/auth/login-sms`
**Frontend:** `authApi.sendOtp(payload)`
```typescript
Request: {
  phone: string;
}
Response: {
  success: boolean;
  message: string;
  otp?: string; // Chỉ trong dev mode
}
```

### POST `/auth/verify-sms`
**Frontend:** `authApi.verifyOtp(payload)`
```typescript
Request: {
  phone: string;
  otp: string;
}
Response: {
  message: string;
  user: BackendUser;
  accessToken: string;
}
```

### GET `/auth/google`
**OAuth Flow:** Redirect đến Google login

### GET `/auth/google/callback`
**OAuth Flow:** Callback từ Google, redirect về frontend với token

### GET `/auth/facebook`
**OAuth Flow:** Redirect đến Facebook login

### GET `/auth/facebook/callback`
**OAuth Flow:** Callback từ Facebook, redirect về frontend với token

---

## 👤 User Endpoints

### POST `/users`
**Frontend:** `userApi.create(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
```

### GET `/users`
**Frontend:** `userApi.findAll(query)`
**Auth:** ✅ Required
**Query:** `?page=1&limit=10&search=keyword`

### GET `/users/:id`
**Frontend:** `userApi.findOne(id)`
**Auth:** ✅ Required

### PUT `/users/:id`
**Frontend:** `userApi.update(id, dto)`
**Auth:** ✅ Required
```typescript
Request: {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  name?: string;
}
```

### DELETE `/users/:id`
**Frontend:** `userApi.deactivate(id)`
**Auth:** ✅ Required

### POST `/users/seller`
**Frontend:** `userApi.updateRoleSeller(payload)`
**Auth:** ✅ Required
```typescript
Request: {
  shopName: string;
  shopDescription: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
}
Response: {
  user: BackendUser;
  accessToken: string; // Token mới với role seller
}
```

---

## 🛍️ Product Endpoints

### GET `/products`
**Frontend:** `productApi.getAll(query)`
**Auth:** ❌ Public
**Query:** `?category=electronics&minPrice=1000&maxPrice=50000&search=iphone&page=1&limit=40`

**Response:** `Product[]`

### GET `/products/:id`
**Frontend:** `productApi.getById(id)`
**Auth:** ❌ Public

**Response:**
```typescript
{
  _id: string;
  name: string;
  price: number;
  stock: number; // Từ inventory-service
  reservedStock: number;
  // ... other fields
}
```

### POST `/products/search`
**Frontend:** `productApi.search(query)`
**Auth:** ❌ Public
```typescript
Request: {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brands?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}
```

### POST `/products`
**Frontend:** `productApi.create(dto)`
**Auth:** ✅ Required (Seller)
```typescript
Request: {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  brand: string;
  condition?: 'new' | 'used';
  categoryIds?: string[];
  tags?: string[];
  images?: string[];
  attributes?: Record<string, any>;
  variants?: Record<string, any>;
  warehouseAddress?: {
    line1: string;
    line2?: string;
    city: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
}
```

### PATCH `/products/:id`
**Frontend:** `productApi.update(id, dto)`
**Auth:** ✅ Required (Seller)
```typescript
Request: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  images?: string[];
  stock?: number;
  brand?: string;
  specifications?: { [key: string]: string };
}
```

### DELETE `/products/:id`
**Frontend:** `productApi.remove(id)`
**Auth:** ✅ Required (Seller)

### GET `/products/seller`
**Frontend:** `productApi.getAllBySeller(query)`
**Auth:** ✅ Required (Seller)
**Query:** `?page=1&limit=10&keyword=search&sort=field`

**Response:**
```typescript
{
  success: boolean;
  data: StoreProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### PATCH `/products/:id/stock`
**Frontend:** `productApi.updateStock(id, amount)`
**Auth:** ✅ Required (Seller)
```typescript
Request: {
  amount: number; // > 0: thêm, < 0: giảm
}
```

---

## 🛒 Cart Endpoints

### GET `/cart`
**Frontend:** `cartApi.getAll()`
**Auth:** ✅ Required

**Response:**
```typescript
CartResponse[] // Grouped by seller
[
  {
    sellerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      product?: Product; // Enriched
    }>;
    total: number;
  }
]
```

### POST `/cart`
**Frontend:** `cartApi.addItem(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  productId: string;
  quantity: number;
  price: number;
  sellerId: string;
}
```

### PATCH `/cart/update`
**Frontend:** `cartApi.updateItem(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  sellerId: string;
  productId: string;
  quantity: number;
  price: number;
}
```

### PATCH `/cart/productQuantity`
**Frontend:** `cartApi.updateQuantity(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  sellerId: string;
  productId: string;
  quantity: number;
}
```

### DELETE `/cart/product`
**Frontend:** `cartApi.removeItem(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  sellerId: string;
  productId: string;
}
```

### POST `/cart/order`
**Frontend:** `cartApi.createOrder(dto)`
**Auth:** ✅ Required
```typescript
Request: {
  items: Array<{
    sellerId: string;
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}
```

---

## 📦 Order Endpoints

### POST `/orders`
**Frontend:** `orderApi.create(dto)`
**Auth:** ✅ Required
```typescript
Request: {
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

### GET `/orders/seller`
**Frontend:** `orderApi.getAllForSeller()`
**Auth:** ✅ Required (Seller)

### GET `/orders/user`
**Frontend:** `orderApi.getAllForUser()`
**Auth:** ✅ Required

### PATCH `/orders/seller/orders/:orderId/confirm`
**Frontend:** (Direct API call)
**Auth:** ✅ Required (Seller)

### PATCH `/orders/seller/orders/:orderId/reject`
**Frontend:** (Direct API call)
**Auth:** ✅ Required (Seller)

### PATCH `/orders/:orderId/complete`
**Frontend:** (Direct API call)
**Auth:** ✅ Required

---

## 💳 Payment Endpoints

### POST `/payment/create-banking`
**Frontend:** (Direct API call)
**Auth:** ✅ Required
```typescript
Request: {
  orderId: string;
  amount: number;
  // ... other payment fields
}
Response: {
  message: string; // "Banking payment requested, waiting for QR"
}
```

### POST `/payment/payos/callback`
**Webhook:** PayOS callback (không gọi từ frontend)

---

## ⭐ Review Endpoints

### POST `/reviews`
**Frontend:** `reviewApi.create(dto)`
**Auth:** ✅ Required
**AI Guard:** ✅ Enabled
```typescript
Request: {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}
```

### GET `/reviews`
**Frontend:** `reviewApi.findAll(query)`
**Auth:** ❌ Public
**Query:** `?productId=xxx&page=1&limit=10`

### GET `/reviews/:id`
**Frontend:** `reviewApi.findOne(id)`
**Auth:** ❌ Public

### PATCH `/reviews/:id`
**Frontend:** `reviewApi.update(id, dto)`
**Auth:** ✅ Required
**AI Guard:** ✅ Enabled
```typescript
Request: {
  rating?: number;
  comment?: string;
  images?: string[];
}
```

### DELETE `/reviews/:id`
**Frontend:** `reviewApi.remove(id)`
**Auth:** ✅ Required

---

## 📸 Media Endpoints

### POST `/media/upload`
**Frontend:** `mediaApi.upload(file)`
**Auth:** ✅ Required
**Content-Type:** `multipart/form-data`
**Field:** `file`

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

## 🔌 WebSocket Events (Payment)

**Connection:** WebSocket to API Gateway

**Events:**
- `QR_CREATED`: QR code đã được tạo
  ```typescript
  {
    type: 'QR_CREATED',
    data: {
      orderId: string;
      qrCode: string;
      // ... other fields
    }
  }
  ```

- `PAYMENT_SUCCESS`: Thanh toán thành công
  ```typescript
  {
    type: 'PAYMENT_SUCCESS',
    data: {
      orderId: string;
      // ... other fields
    }
  }
  ```

- `QR_EXPIRED`: QR code hết hạn
  ```typescript
  {
    type: 'QR_EXPIRED',
    orderId: string;
  }
  ```

**Frontend Hook:** `useSSE()` hoặc `usePaymentSocket()`

---

## 📊 Response Format Patterns

### Success Response
```typescript
// Pattern 1: Direct data
Product[]

// Pattern 2: Wrapped in data
{
  data: Product[]
}

// Pattern 3: With success flag
{
  success: true;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Error Response
```typescript
{
  message: string;
  error?: string;
  status?: number;
  data?: any;
}
```

**Note:** `apiClient.ts` tự động unwrap: `return (payload?.data ?? payload) as T;`

---

## 🔍 Query Parameters Common Patterns

### Pagination
```
?page=1&limit=40
```

### Filtering
```
?category=electronics&minPrice=1000&maxPrice=50000
```

### Search
```
?search=iphone
?keyword=iphone (for POST /products/search)
```

### Sorting
```
?sortBy=price&sortOrder=asc
```

---

## 🚨 Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (Token expired/invalid)
- `403`: Forbidden (No permission)
- `404`: Not Found
- `500`: Internal Server Error

### Auto Retry on 401
Frontend tự động:
1. Gọi `/auth/refresh` với cookie
2. Lấy accessToken mới
3. Retry request ban đầu

---

## 📝 Notes

1. **Authentication:** 
   - Access token trong `Authorization: Bearer <token>` header
   - Refresh token trong HTTP-only cookie
   - Auto-refresh khi gặp 401

2. **CORS:**
   - Backend cho phép `http://localhost:5173`
   - `credentials: true` cho cookie

3. **File Upload:**
   - Sử dụng `FormData`
   - Field name: `file`
   - Auto-retry với FormData factory function

4. **WebSocket:**
   - Kết nối đến API Gateway
   - User ID từ JWT token
   - Real-time events cho payment flow

