# API Connection Checklist - Click2Buy

## ✅ Pre-Setup Checklist

### Environment Setup
- [ ] Tạo file `.env` trong `frontend/` với:
  ```env
  VITE_API_BASE_URL=http://localhost:3000
  ```
- [ ] Kiểm tra `apiClient.ts` đang đọc từ `import.meta.env.VITE_API_BASE_URL`
- [ ] Đảm bảo frontend chạy trên port 5173 (hoặc cập nhật CORS trong backend)

### Backend Services
- [ ] Docker Compose đang chạy: `docker-compose up -d`
- [ ] API Gateway chạy trên port 3000: `docker logs click2buy_api-gateway`
- [ ] Kafka đang chạy: `docker ps | grep kafka`
- [ ] MongoDB đang chạy: `docker ps | grep mongo`
- [ ] Redis đang chạy: `docker ps | grep redis`

### Microservices Status
- [ ] Auth Service: `docker logs click2buy_auth-service` (không có errors)
- [ ] Product Service: `docker logs click2buy_product-service`
- [ ] Cart Service: `docker logs click2buy_cart-service`
- [ ] Order Service: `docker logs click2buy_order-service`
- [ ] Payment Service: `docker logs click2buy_payment-service`
- [ ] Review Service: `docker logs click2buy_review-service`
- [ ] Media Service: `docker logs click2buy_media-service`
- [ ] User Service: `docker logs click2buy_user-service`

---

## 🔐 Authentication Testing

### Register
- [ ] Mở browser console (F12)
- [ ] Test register với form
- [ ] Kiểm tra response có `user` và `accessToken`
- [ ] Kiểm tra token được lưu trong localStorage (`click2buy:accessToken`)
- [ ] Kiểm tra refresh token trong cookie (DevTools → Application → Cookies)

### Login
- [ ] Test login với username/password
- [ ] Kiểm tra response format đúng
- [ ] Kiểm tra token được lưu
- [ ] Kiểm tra user info được lưu trong localStorage

### Token Refresh
- [ ] Đợi token hết hạn (hoặc manually expire)
- [ ] Thực hiện một API call yêu cầu auth
- [ ] Kiểm tra console log: auto-refresh được trigger
- [ ] Kiểm tra request được retry với token mới
- [ ] Kiểm tra không bị logout

### Logout
- [ ] Test logout
- [ ] Kiểm tra token bị xóa khỏi localStorage
- [ ] Kiểm tra cookie bị clear
- [ ] Kiểm tra user bị clear

### Social Login (Optional)
- [ ] Test Google OAuth flow
- [ ] Test Facebook OAuth flow
- [ ] Kiểm tra redirect về frontend với token

### SMS Login (Optional)
- [ ] Test send OTP
- [ ] Kiểm tra OTP được trả về (dev mode)
- [ ] Test verify OTP
- [ ] Kiểm tra login thành công

---

## 🛍️ Product Testing

### Get All Products
- [ ] Mở trang chủ
- [ ] Kiểm tra Network tab: `GET /products?limit=40`
- [ ] Kiểm tra response có array products
- [ ] Kiểm tra products được hiển thị trên UI
- [ ] Kiểm tra pagination nếu có

### Get Product by ID
- [ ] Click vào một product
- [ ] Kiểm tra Network tab: `GET /products/:id`
- [ ] Kiểm tra response có `stock` và `reservedStock`
- [ ] Kiểm tra product detail được hiển thị

### Search Products
- [ ] Test search với keyword
- [ ] Kiểm tra `POST /products/search`
- [ ] Kiểm tra kết quả search được hiển thị

### Create Product (Seller)
- [ ] Login với seller account
- [ ] Test tạo product mới
- [ ] Kiểm tra `POST /products` với auth header
- [ ] Kiểm tra product được tạo thành công

### Update Product (Seller)
- [ ] Test update product
- [ ] Kiểm tra `PATCH /products/:id`
- [ ] Kiểm tra changes được save

### Delete Product (Seller)
- [ ] Test delete product
- [ ] Kiểm tra `DELETE /products/:id`
- [ ] Kiểm tra product bị xóa (soft delete)

### Get Seller Products
- [ ] Test `GET /products/seller`
- [ ] Kiểm tra response có pagination
- [ ] Kiểm tra products được enrich với stock

---

## 🛒 Cart Testing

### Get Cart
- [ ] Login với user account
- [ ] Test `GET /cart`
- [ ] Kiểm tra response có carts grouped by seller
- [ ] Kiểm tra products được enrich

### Add to Cart
- [ ] Test add product to cart
- [ ] Kiểm tra `POST /cart` với đúng payload
- [ ] Kiểm tra cart được update
- [ ] Kiểm tra UI hiển thị cart count

### Update Cart Item
- [ ] Test update quantity
- [ ] Kiểm tra `PATCH /cart/update`
- [ ] Kiểm tra `PATCH /cart/productQuantity`
- [ ] Kiểm tra changes được reflect

### Remove from Cart
- [ ] Test remove item
- [ ] Kiểm tra `DELETE /cart/product`
- [ ] Kiểm tra item bị xóa

### Create Order from Cart
- [ ] Test checkout từ cart
- [ ] Kiểm tra `POST /cart/order`
- [ ] Kiểm tra order được tạo

---

## 📦 Order Testing

### Create Order
- [ ] Test tạo order mới
- [ ] Kiểm tra `POST /orders` với đầy đủ shipping info
- [ ] Kiểm tra order được tạo với status pending

### Get Orders (User)
- [ ] Test `GET /orders/user`
- [ ] Kiểm tra orders của user được hiển thị
- [ ] Kiểm tra order status được hiển thị đúng

### Get Orders (Seller)
- [ ] Login với seller
- [ ] Test `GET /orders/seller`
- [ ] Kiểm tra orders của seller được hiển thị

### Approve Order (Seller)
- [ ] Test approve order
- [ ] Kiểm tra `PATCH /orders/seller/orders/:orderId/confirm`
- [ ] Kiểm tra order status chuyển sang confirmed

### Reject Order (Seller)
- [ ] Test reject order
- [ ] Kiểm tra `PATCH /orders/seller/orders/:orderId/reject`
- [ ] Kiểm tra order status chuyển sang rejected

### Complete Order
- [ ] Test complete order
- [ ] Kiểm tra `PATCH /orders/:orderId/complete`
- [ ] Kiểm tra order status chuyển sang completed

---

## 💳 Payment Testing

### Create Banking Payment
- [ ] Test tạo payment request
- [ ] Kiểm tra `POST /payment/create-banking`
- [ ] Kiểm tra response message

### WebSocket Connection
- [ ] Kiểm tra WebSocket connection được establish
- [ ] Test nhận event `QR_CREATED`
- [ ] Kiểm tra QR code được hiển thị

### Payment Success Event
- [ ] Simulate payment success (hoặc thực tế)
- [ ] Kiểm tra nhận event `PAYMENT_SUCCESS`
- [ ] Kiểm tra UI update order status

### QR Expired Event
- [ ] Đợi QR hết hạn (hoặc simulate)
- [ ] Kiểm tra nhận event `QR_EXPIRED`
- [ ] Kiểm tra UI hiển thị message

---

## ⭐ Review Testing

### Create Review
- [ ] Test tạo review cho product
- [ ] Kiểm tra `POST /reviews` với AI Guard
- [ ] Kiểm tra review được tạo (nếu pass AI check)

### Get Reviews
- [ ] Test `GET /reviews?productId=xxx`
- [ ] Kiểm tra reviews được hiển thị
- [ ] Kiểm tra pagination nếu có

### Update Review
- [ ] Test update review
- [ ] Kiểm tra `PATCH /reviews/:id`
- [ ] Kiểm tra changes được save

### Delete Review
- [ ] Test delete review
- [ ] Kiểm tra `DELETE /reviews/:id`
- [ ] Kiểm tra review bị xóa

---

## 📸 Media Testing

### Upload File
- [ ] Test upload ảnh
- [ ] Kiểm tra `POST /media/upload` với FormData
- [ ] Kiểm tra response có URL
- [ ] Kiểm tra URL có thể access được

### Upload Multiple Files
- [ ] Test upload nhiều files
- [ ] Kiểm tra tất cả files được upload thành công

---

## 🐛 Common Issues & Solutions

### CORS Error
**Symptom:** `Access-Control-Allow-Origin` error
**Solution:**
- Kiểm tra CORS config trong `api-gateway/src/main.ts`
- Đảm bảo frontend origin đúng
- Kiểm tra `credentials: true`

### 401 Unauthorized
**Symptom:** Tất cả requests bị 401
**Solution:**
- Kiểm tra token trong localStorage
- Kiểm tra refresh token trong cookie
- Test refresh token flow manually

### 500 Internal Server Error
**Symptom:** Backend trả về 500
**Solution:**
- Kiểm tra logs: `docker logs click2buy_api-gateway`
- Kiểm tra microservice logs
- Kiểm tra Kafka connection

### Response Format Không Đúng
**Symptom:** Frontend không parse được response
**Solution:**
- Kiểm tra mapper functions
- Kiểm tra `apiClient.ts` unwrap logic
- Xem Network tab để xem raw response

### WebSocket Không Kết Nối
**Symptom:** Không nhận được real-time events
**Solution:**
- Kiểm tra WebSocket gateway đang chạy
- Kiểm tra JWT token trong connection
- Kiểm tra user ID mapping

---

## 📊 Performance Testing

### Load Testing
- [ ] Test với 100+ products
- [ ] Kiểm tra pagination hoạt động
- [ ] Kiểm tra không bị timeout

### Concurrent Requests
- [ ] Test multiple API calls cùng lúc
- [ ] Kiểm tra không bị race conditions
- [ ] Kiểm tra token refresh không bị duplicate

---

## ✅ Final Checklist

### All Features Working
- [ ] Authentication flow hoàn chỉnh
- [ ] Product CRUD operations
- [ ] Cart operations
- [ ] Order creation và management
- [ ] Payment flow với WebSocket
- [ ] Review system
- [ ] File upload

### Error Handling
- [ ] 401 errors được handle đúng
- [ ] Network errors được catch
- [ ] User-friendly error messages

### Security
- [ ] Tokens không bị expose trong logs
- [ ] HTTPS trong production (nếu có)
- [ ] CORS properly configured

---

## 📝 Notes

Sau khi hoàn thành checklist này, hệ thống đã sẵn sàng cho:
- Development testing
- Integration testing
- User acceptance testing

Nếu có bất kỳ issue nào, tham khảo:
- `API_CONNECTION_GUIDE.md` - Hướng dẫn chi tiết
- `API_ENDPOINTS_MAPPING.md` - Mapping endpoints
- Console logs và Network tab trong DevTools

