# Seller Analytics Service

Pure analytics microservice that aggregates seller performance metrics for Click2Buy.

## 🎯 Chức năng chính

1. **Event-Driven**
   - Consumes `order.confirmed` events to update daily revenue & product level statistics.

2. **Analytics APIs (read-only)**
   - `GET /analytics/revenue?sellerId=xxx&type=WEEK|MONTH`
   - `GET /analytics/top-products?sellerId=xxx&limit=5`

## 🏗️ Cấu trúc

```
seller-analytics-service/
├── src/
│   ├── schemas/
│   │   ├── daily-revenue.schema.ts
│   │   └── product-analytics.schema.ts
│   ├── services/
│   │   └── analytics.service.ts
│   ├── controllers/
│   │   ├── analytics.controller.ts
│   │   └── kafka-consumer.controller.ts
│   ├── app.module.ts
│   └── main.ts
└── ...
```

## 🔧 Cấu hình

### Environment Variables (.env)
```env
PORT=3009
MONGO_URI=mongodb://click2buy_mongo:27017/click2buy_analytics
```

### Docker Compose
- Port mapping: `3109:3009`
- Depends on `kafka`, `mongo`
- Command: `npm install --legacy-peer-deps && npm run start:dev`

## 📊 MongoDB Collections

### DailyRevenue
```ts
{
  sellerId: string;
  date: Date;        // normalized to 00:00:00
  totalRevenue: number;
  totalOrders: number;
}
```

### ProductAnalytics
```ts
{
  sellerId: string;
  productId: string;
  productName?: string;
  totalSold: number;
  totalRevenue: number;
}
```

## 🔄 Kafka

- **Consumer Topic:** `order.confirmed`
- **Payload:** `{ sellerId, totalAmount, confirmedAt, items: [{ productId, productName, quantity, price }] }`
- Logic runs inside a Mongo transaction to keep revenue & product stats consistent.

## 📝 Notes

- Service only reads/aggregates data – no longer handles seller order operations.
- APIs always require `sellerId` to scope analytics.
- Revenue API fills missing days with zeros to keep charts continuous.

