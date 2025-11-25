# Seller Analytics Service

Microservice chịu trách nhiệm quản lý đơn hàng cho Seller và báo cáo doanh thu trong hệ thống Click2Buy E-commerce.

## 🎯 Chức năng chính

### 1. Event-Driven (Kafka Consumers)
- **order.created**: Lưu snapshot đơn hàng với status = PENDING
- **order.delivery.success**: Cộng dồn doanh thu và số lượng đơn hàng theo ngày

### 2. Seller Order Management API
- `GET /seller/orders`: Lấy danh sách đơn hàng (phân trang, lọc theo status)
- `PUT /seller/orders/:id/confirm`: Duyệt đơn hàng → Emit `order.confirmed`
- `PUT /seller/orders/:id/reject`: Từ chối đơn hàng → Emit `order.cancelled`

### 3. Analytics API (Dashboard)
- `GET /analytics/revenue?type=WEEK|MONTH`: Doanh thu theo tuần/tháng

## 🏗️ Cấu trúc

```
seller-analytics-service/
├── src/
│   ├── schemas/          # MongoDB schemas
│   │   ├── order-snapshot.schema.ts
│   │   └── daily-revenue.schema.ts
│   ├── services/         # Business logic
│   │   ├── order.service.ts
│   │   └── analytics.service.ts
│   ├── controllers/     # HTTP & Kafka controllers
│   │   ├── seller.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── kafka-consumer.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── Dockerfile
├── package.json
└── .env
```

## 🔧 Cấu hình

### Environment Variables (.env)
```env
PORT=3006
MONGO_URI=mongodb://click2buy_mongo:27017/click2buy_analytics
```

### Docker Compose
Service được cấu hình trong `docker-compose.yml`:
- Port: `3106:3006`
- Depends on: `kafka`, `mongo`
- Network: `click2buy_net`
- Command: `npm install --legacy-peer-deps && npm run start:dev`

## 📊 MongoDB Collections

### OrderSnapshot
Lưu snapshot đơn hàng để phục vụ API `/seller/orders`:
```typescript
{
  orderId: "order_123",
  items: [{ productId, quantity, price }],
  totalAmount: 50000,
  status: "PENDING" | "CONFIRMED" | "CANCELLED",
  createdAt: Date
}
```

### DailyRevenue
Lưu doanh thu theo ngày:
```typescript
{
  date: "2024-01-15", // YYYY-MM-DD
  totalRevenue: 1000000,
  orderCount: 50
}
```

## 🔄 Kafka Events

### Consumed Events
- `order.created`: Nhận từ order-service khi có đơn mới
- `order.delivery.success`: Nhận khi đơn giao hàng thành công

### Produced Events
- `order.confirmed`: Emit khi Seller duyệt đơn → Inventory service trừ kho
- `order.cancelled`: Emit khi Seller từ chối đơn

## 🚀 API Gateway Integration

API Gateway route các request sau về service này:
- `/seller/*` → `SellerAnalyticsGateway`
- `/analytics/*` → `SellerAnalyticsGateway`

Sử dụng HTTP proxy (axios) để forward requests.

## 📝 Notes

- Service vừa là HTTP server (port 3006) vừa là Kafka microservice
- MongoDB connection sử dụng `ConfigService` để tránh lỗi `uri undefined`
- DailyRevenue được cập nhật khi nhận event `order.delivery.success`
- API `/analytics/revenue` trả về đầy đủ các ngày, ngày không có đơn sẽ có `totalRevenue: 0`

