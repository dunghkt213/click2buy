# Quick Start - Kết Nối API Click2Buy

## 🚀 Bước 1: Cấu Hình Frontend

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🐳 Bước 2: Khởi Động Backend

```bash
cd ecommerce-microservices
docker-compose up -d
```

Kiểm tra services đang chạy:
```bash
docker ps
```

## ✅ Bước 3: Kiểm Tra Kết Nối

### Test API Gateway
```bash
curl http://localhost:3000/products
```

### Test từ Frontend
1. Start frontend: `npm run dev` (trong thư mục `frontend/`)
2. Mở browser: `http://localhost:5173`
3. Mở DevTools (F12) → Network tab
4. Thực hiện một action (ví dụ: load products)
5. Kiểm tra request đến `http://localhost:3000`

## 🔑 Bước 4: Test Authentication

### Register
```typescript
// Trong browser console
import { authApi } from './src/apis/auth';
await authApi.register({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});
```

### Login
```typescript
await authApi.login({
  username: 'testuser',
  password: 'password123'
});
```

Kiểm tra:
- Token trong localStorage: `click2buy:accessToken`
- Cookie: `refresh_token` (HTTP-only)

## 📦 Bước 5: Test Product API

```typescript
import { productApi } from './src/apis/product';

// Get all products
const products = await productApi.getAll({ limit: 40 });
console.log('Products:', products);

// Get product by ID
const product = await productApi.getById('product-id');
console.log('Product:', product);
```

## 🛒 Bước 6: Test Cart API

```typescript
import { cartApi } from './src/apis/cart';

// Get cart
const carts = await cartApi.getAll();
console.log('Carts:', carts);

// Add to cart
await cartApi.addItem({
  productId: 'product-id',
  quantity: 1,
  price: 100000,
  sellerId: 'seller-id'
});
```

## 🔍 Troubleshooting Nhanh

### CORS Error
**Fix:** Kiểm tra `api-gateway/src/main.ts`:
```typescript
app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
});
```

### 401 Unauthorized
**Fix:** 
1. Kiểm tra token trong localStorage
2. Test refresh: `await authApi.refresh()`
3. Login lại nếu cần

### API Gateway không response
**Fix:**
```bash
# Kiểm tra logs
docker logs click2buy_api-gateway

# Restart service
docker-compose restart api-gateway
```

### Kafka Connection Error
**Fix:**
```bash
# Kiểm tra Kafka
docker logs click2buy_kafka

# Restart Kafka
docker-compose restart kafka
```

## 📚 Tài Liệu Chi Tiết

- **Hướng dẫn đầy đủ:** `API_CONNECTION_GUIDE.md`
- **Mapping endpoints:** `API_ENDPOINTS_MAPPING.md`
- **Checklist testing:** `API_CONNECTION_CHECKLIST.md`

## 🎯 Quick Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker logs click2buy_api-gateway -f

# Restart a service
docker-compose restart api-gateway

# Check service status
docker ps | grep click2buy
```

## ✅ Checklist Nhanh

- [ ] `.env` file đã tạo với `VITE_API_BASE_URL`
- [ ] Docker services đang chạy
- [ ] API Gateway accessible tại `http://localhost:3000`
- [ ] Frontend có thể gọi API (kiểm tra Network tab)
- [ ] Authentication flow hoạt động
- [ ] Products được load thành công

## 💡 Tips

1. **Luôn kiểm tra Network tab** trong DevTools để debug
2. **Xem console logs** để catch errors
3. **Kiểm tra response format** trong Network tab
4. **Test với Postman/Insomnia** để verify backend trước
5. **Xem Docker logs** khi có vấn đề với services

---

**Nếu gặp vấn đề, xem chi tiết trong `API_CONNECTION_GUIDE.md`**

