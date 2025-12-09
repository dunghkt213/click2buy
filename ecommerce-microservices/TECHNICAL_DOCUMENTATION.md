# Tài Liệu Kỹ Thuật - Click2Buy E-commerce Microservices

## 1. Tổng Quan Kiến Trúc

### 1.1 Stack Công Nghệ

| Layer | Technology | Version |
|-------|------------|---------|
| Backend Framework | NestJS | Latest |
| Database | MongoDB | 6.x |
| Message Broker | Apache Kafka | 7.6.0 (Confluent) |
| Cache | Redis | 7.x |
| Container | Docker & Docker Compose | - |
| Language | TypeScript | - |
| Authentication | JWT (Access + Refresh Token) | - |

### 1.2 Mô Hình Giao Tiếp

Hệ thống sử dụng **Hybrid Communication Pattern**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Frontend)                              │
│                         http://localhost:5173                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (:3000)                              │
│                    - Request Routing                                     │
│                    - Cookie Management (Refresh Token)                   │
│                    - CORS Handling                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            Kafka Request/Reply              Kafka Pub/Sub
            (Synchronous RPC)               (Asynchronous Events)
                    │                               │
                    ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MICROSERVICES LAYER                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Auth   │ │  User   │ │ Product │ │  Cart   │ │  Order  │           │
│  │ Service │ │ Service │ │ Service │ │ Service │ │ Service │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐           │
│  │ Payment │ │ Review  │ │Inventory│ │  Seller Analytics   │           │
│  │ Service │ │ Service │ │ Service │ │      Service        │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                       │
│         ┌──────────────┐    ┌──────────────┐    ┌──────────────┐        │
│         │   MongoDB    │    │    Kafka     │    │    Redis     │        │
│         │   (:27027)   │    │   (:19092)   │    │   (:6379)    │        │
│         └──────────────┘    └──────────────┘    └──────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```


#### Giao Tiếp Đồng Bộ (Synchronous - Request/Reply)
- **Pattern**: Kafka Request/Reply với `subscribeToResponseOf()`
- **Use case**: API Gateway gọi các service và chờ response
- **Ví dụ**: `auth.login`, `product.findAll`, `cart.getAll`

#### Giao Tiếp Bất Đồng Bộ (Asynchronous - Pub/Sub)
- **Pattern**: Kafka Event-Driven với `emit()` và `@EventPattern()`
- **Use case**: Broadcast events để các service khác xử lý
- **Ví dụ**: `order.created`, `payment.success`, `inventory.synced`

---

## 2. Danh Sách Service & Chức Năng

### 2.1 API Gateway (Port: 3000)

**Vai trò**: Entry point duy nhất cho tất cả requests từ client

**Chức năng chính**:
- Routing requests đến các microservices qua Kafka
- Quản lý Cookie (Refresh Token với HttpOnly)
- CORS configuration cho frontend
- Request logging middleware

**Kafka Topics (Request/Reply)**:
| Gateway | Topics |
|---------|--------|
| AuthGateway | `auth.login`, `auth.register`, `auth.refresh`, `auth.logout` |
| UserGateway | `user.create`, `user.findAll`, `user.findOne`, `user.update` |
| ProductGateway | `product.create`, `product.findAll`, `product.findOne`, `product.update`, `product.remove`, `product.search` |
| CartGateway | `cart.getAll`, `cart.add`, `cart.update`, `cart.remove`, `cart.productQuantity` |
| OrderGateway | `order.create`, `order.getAllOrderForSaller` |
| ReviewGateway | `review.create`, `review.findAll`, `review.findOne`, `review.update`, `review.delete` |

---

### 2.2 Auth Service (Port: 3101 → 3001)

**Vai trò**: Xác thực và quản lý token

**Chức năng chính**:
- Đăng ký người dùng (delegate tạo user sang User Service)
- Đăng nhập với username/password
- JWT Access Token (short-lived) + Refresh Token (long-lived)
- Token rotation và revocation
- Lưu trữ Refresh Token trong MongoDB

**Data Model - Token**:
```typescript
{
  userId: string,
  token: string,        // Refresh token value
  expiresAt: Date,
  isRevoked: boolean
}
```

**Kafka Topics**:
- `auth.register` → Gọi `user.create` để tạo user
- `auth.login` → Gọi `user.getByforpasswordHash` để validate
- `auth.refresh` → Tạo Access Token mới
- `auth.logout` → Revoke Refresh Token
- `auth.verify` → Verify Access Token

---

### 2.3 User Service (Port: 3102 → 3002)

**Vai trò**: Quản lý thông tin người dùng

**Chức năng chính**:
- CRUD operations cho User
- Quản lý địa chỉ (multiple addresses)
- Phân quyền: `customer`, `seller`, `admin`
- Soft delete (deactivate)

**Data Model - User**:
```typescript
{
  username: string,      // unique, lowercase
  email: string,         // unique, lowercase
  passwordHash: string,  // bcrypt hashed
  role: 'customer' | 'seller' | 'admin',
  phone?: string,
  avatar?: string,
  isActive: boolean,
  lastLogin?: Date,
  address: Address[]     // Multiple addresses
}
```

**Kafka Topics**:
- `user.create` - Tạo user mới
- `user.findAll` - Lấy danh sách (admin only)
- `user.findOne` - Lấy theo ID
- `user.getByCondition` - Tìm theo field
- `user.getByforpasswordHash` - Lấy user kèm password hash (cho auth)
- `user.update` - Cập nhật profile
- `user.deactivate` - Vô hiệu hóa tài khoản

---

### 2.4 Product Service (Port: 3103 → 3003)

**Vai trò**: Quản lý sản phẩm

**Chức năng chính**:
- CRUD sản phẩm (chỉ seller mới tạo/sửa/xóa được)
- Full-text search
- Pagination, filtering, sorting
- Soft delete với status `DELETED`
- Sync với Inventory Service và Search Service qua events

**Data Model - Product**:
```typescript
{
  name: string,
  ownerId: string,       // Seller ID
  description?: string,
  price: number,
  salePrice?: number,
  discount?: number,
  brand: string,
  condition: 'new' | 'used',
  tags?: string[],
  images?: string[],
  categoryIds?: string[],
  attributes?: Record<string, any>,
  variants?: Record<string, any>,
  ratingAvg: number,
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED',
  isActive: boolean,
  warehouseAddress?: WarehouseAddress
}
```

**Kafka Topics**:
- `product.create` - Tạo sản phẩm → emit `inventory.sync.requested`
- `product.findAll` - Lấy danh sách
- `product.findOne` - Lấy chi tiết
- `product.update` - Cập nhật
- `product.remove` - Soft delete → emit `cart.productDisabled`
- `product.search` - Tìm kiếm

**Events Emitted**:
- `inventory.sync.requested` - Yêu cầu tạo inventory record
- `search.sync.requested` - Yêu cầu index vào search
- `cart.productDisabled` - Thông báo sản phẩm bị xóa
- `noti.product.created` - Thông báo sản phẩm đã sync xong

---

### 2.5 Cart Service (Port: 3104 → 3004)

**Vai trò**: Quản lý giỏ hàng

**Chức năng chính**:
- Giỏ hàng tách theo Seller (mỗi seller 1 cart riêng)
- Thêm/sửa/xóa sản phẩm trong giỏ
- Tự động xóa cart khi hết items

**Data Model - Cart**:
```typescript
{
  userId: string,
  sellerId: string,      // Mỗi seller 1 cart riêng
  items: [{
    productId: string,
    quantity: number,
    price: number
  }]
}
```

**Kafka Topics**:
- `cart.getAll` - Lấy tất cả carts của user
- `cart.add` - Thêm sản phẩm
- `cart.update` - Cập nhật item
- `cart.remove` - Xóa item
- `cart.productQuantity` - Cập nhật số lượng

---

### 2.6 Order Service (Port: 3109 → 3009)

**Vai trò**: Quản lý đơn hàng

**Chức năng chính**:
- Tạo đơn hàng từ cart (có thể nhiều đơn từ nhiều seller)
- Validate giá từ Product Service
- Quản lý trạng thái đơn hàng
- Timeout mechanism cho đơn chưa thanh toán

**Data Model - Order**:
```typescript
{
  userId: string,
  ownerId: string,       // Seller ID
  items: [{
    productId: string,
    quantity: number,
    price: number        // Giá tại thời điểm đặt
  }],
  total: number,
  paymentMethod: string,
  status: 'PENDING_PAYMENT' | 'PENDING_ACCEPT' | ...,
  expiresAt: Date        // Timeout 15 phút
}
```

**Order Status Flow**:
```
PENDING_PAYMENT → (payment.success) → PENDING_ACCEPT → ...
```

**Kafka Topics**:
- `order.create` - Tạo đơn hàng → emit `order.created`
- `order.getAllOrderForSaller` - Lấy đơn của seller
- `payment.success` - Listener: cập nhật status

**Events Emitted**:
- `order.created` - Broadcast khi tạo đơn thành công

---

### 2.7 Payment Service (Port: 3007)

**Vai trò**: Xử lý thanh toán

**Chức năng chính**:
- Tạo payment record khi có đơn hàng
- Hỗ trợ COD và Banking
- Emit event khi thanh toán thành công

**Data Model - Payment**:
```typescript
{
  userId: string,
  orderId: string,
  paymentMethod: 'COD' | 'BANKING',
  total: number,
  paidAmount: number,
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
}
```

**Kafka Topics**:
- `order.created` - Listener: tự động tạo payment
- `payment.findAll` - Query payments

**Events Emitted**:
- `payment.success` - Thông báo thanh toán thành công

---

### 2.8 Inventory Service (Port: 3108 → 3008)

**Vai trò**: Quản lý tồn kho

**Chức năng chính**:
- Reserve stock khi tạo đơn
- Commit stock khi đơn thành công
- Release stock khi hủy đơn/payment fail
- Tự động cập nhật status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)

**Data Model - Inventory**:
```typescript
{
  productId: string,     // unique
  ownerId: string,
  availableStock: number,
  reservedStock: number,
  lowStockThreshold: number,  // default: 5
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED'
}
```

**Kafka Topics**:
- `order.created` - Reserve stock
- `order.success` - Commit stock (giảm reserved)
- `payment.cancelled` - Release stock
- `inventory.sync.requested` - Tạo inventory record mới
- `inventory.getStock.request` - Query stock
- `inventory.addStock` - Thêm stock
- `inventory.adjustStock` - Điều chỉnh stock

**Events Emitted**:
- `inventory.synced` - Xác nhận đã sync
- `inventory.released` - Xác nhận đã release stock

---

### 2.9 Review Service (Port: 3105 → 3005)

**Vai trò**: Quản lý đánh giá sản phẩm

**Chức năng chính**:
- CRUD reviews
- Liên kết với product và user

**Kafka Topics**:
- `review.create` - Tạo review
- `review.findAll` - Lấy danh sách
- `review.findOne` - Lấy chi tiết
- `review.update` - Cập nhật
- `review.delete` - Xóa

---

### 2.10 Seller Analytics Service

**Vai trò**: Thống kê và báo cáo cho Seller

**Chức năng chính**:
- Tổng hợp doanh thu theo ngày
- Thống kê sản phẩm bán chạy
- Dashboard data cho seller

**Data Models**:

**DailyRevenue**:
```typescript
{
  sellerId: string,
  date: Date,            // Normalized to 00:00:00
  totalRevenue: number,
  totalOrders: number
}
```

**ProductAnalytics**:
```typescript
{
  sellerId: string,
  productId: string,
  productName?: string,
  totalSold: number,
  totalRevenue: number
}
```

**Kafka Topics**:
- `order.confirmed` - Listener: cập nhật analytics

**REST APIs** (qua HTTP proxy từ Gateway):
- `GET /analytics/revenue?type=WEEK|MONTH` - Doanh thu theo ngày
- `GET /analytics/top-products?limit=5` - Top sản phẩm bán chạy

---

### 2.11 Media Service (Port: 3106 → 3006) - *Commented out*

**Vai trò**: Upload và quản lý media files

**Chức năng chính**:
- Upload ảnh lên Google Drive
- Trả về URL public

*Lưu ý: Service này đang bị comment out trong docker-compose*

---

## 3. Cơ Chế Hoạt Động (Workflow)

### 3.1 Luồng Request: Client → API Gateway → Microservice

```
┌──────────┐     HTTP POST      ┌─────────────┐    Kafka send()    ┌─────────────┐
│  Client  │ ─────────────────► │ API Gateway │ ─────────────────► │ Auth Service│
│(Frontend)│  /auth/login       │             │  'auth.login'      │             │
└──────────┘                    └─────────────┘                    └─────────────┘
     ▲                                │                                   │
     │                                │                                   │
     │         HTTP Response          │      Kafka Response               │
     └────────────────────────────────┴───────────────────────────────────┘
```

**Chi tiết luồng Login**:

1. **Client** gửi POST `/auth/login` với `{ username, password }`
2. **API Gateway** nhận request, gọi Kafka:
   ```typescript
   this.kafka.send('auth.login', dto).toPromise()
   ```
3. **Auth Service** nhận message qua `@MessagePattern('auth.login')`:
   - Gọi `user.getByforpasswordHash` để lấy user từ User Service
   - Validate password với bcrypt
   - Generate Access Token + Refresh Token
   - Lưu Refresh Token vào MongoDB
   - Return response
4. **API Gateway** nhận response:
   - Set cookie `refresh_token` (HttpOnly)
   - Return `{ user, accessToken }` cho client

---

### 3.2 Cơ Chế Event-Driven: Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ORDER CREATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐                                                                     
  │  Client  │                                                                     
  └────┬─────┘                                                                     
       │ POST /orders                                                              
       ▼                                                                           
  ┌─────────────┐                                                                  
  │ API Gateway │                                                                  
  └──────┬──────┘                                                                  
         │ kafka.send('order.create')                                              
         ▼                                                                         
  ┌─────────────┐     kafka.send('product.findOne')     ┌─────────────────┐       
  │   Order     │ ────────────────────────────────────► │ Product Service │       
  │   Service   │ ◄──────────────────────────────────── │                 │       
  └──────┬──────┘     (validate price)                  └─────────────────┘       
         │                                                                         
         │ kafka.emit('order.created')                                             
         │                                                                         
         ├─────────────────────────────────────────────────────────────────┐       
         │                                                                 │       
         ▼                                                                 ▼       
  ┌─────────────────┐                                           ┌─────────────────┐
  │ Payment Service │                                           │Inventory Service│
  │                 │                                           │                 │
  │ @MessagePattern │                                           │ @MessagePattern │
  │('order.created')│                                           │('order.created')│
  └────────┬────────┘                                           └────────┬────────┘
           │                                                             │         
           │ Create Payment                                              │ Reserve 
           │ record                                                      │ Stock   
           │                                                             │         
           │ kafka.emit('payment.success')                               │         
           │                                                             │         
           ▼                                                             │         
  ┌─────────────┐                                                        │         
  │   Order     │ ◄──────────────────────────────────────────────────────┘         
  │   Service   │                                                                  
  │             │                                                                  
  │ @MessagePattern('payment.success')                                             
  │ Update status: PENDING_PAYMENT → PENDING_ACCEPT                                
  └─────────────┘                                                                  
```

**Chi tiết Event Flow**:

1. **Order Service** tạo đơn hàng:
   - Validate giá từ Product Service (RPC call)
   - Lưu order với status `PENDING_PAYMENT`
   - Emit event `order.created`:
     ```typescript
     this.kafka.emit('order.created', {
       userId,
       orderIds,
       paymentMethod,
       products,
       total
     });
     ```

2. **Payment Service** lắng nghe `order.created`:
   - Tạo Payment record
   - Nếu `paymentMethod === 'BANKING'` → set `paidAmount = total`
   - Emit `payment.success`:
     ```typescript
     this.kafka.emit('payment.success', {
       userId, orderId, paymentMethod, total, paidAmount, status, paymentId
     });
     ```

3. **Inventory Service** lắng nghe `order.created`:
   - Reserve stock cho từng product:
     ```typescript
     inventory.availableStock -= quantity;
     inventory.reservedStock += quantity;
     ```

4. **Order Service** lắng nghe `payment.success`:
   - Cập nhật status: `PENDING_PAYMENT` → `PENDING_ACCEPT`

---

### 3.3 Product Creation với Multi-Service Sync

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCT CREATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐                                                                     
  │  Seller  │                                                                     
  └────┬─────┘                                                                     
       │ POST /products                                                            
       ▼                                                                           
  ┌─────────────────┐                                                              
  │ Product Service │                                                              
  │                 │                                                              
  │ 1. Create product in MongoDB                                                   
  │ 2. Set Redis sync state: { inventory: 'pending', search: 'pending' }           
  │ 3. Emit events                                                                 
  └────────┬────────┘                                                              
           │                                                                       
           ├──── emit('inventory.sync.requested') ────────────────┐                
           │                                                      │                
           └──── emit('search.sync.requested') ──────┐            │                
                                                     │            │                
                                                     ▼            ▼                
                                            ┌──────────────┐ ┌─────────────────┐   
                                            │Search Service│ │Inventory Service│   
                                            │              │ │                 │   
                                            │ Index product│ │ Create inventory│   
                                            │              │ │ record          │   
                                            └──────┬───────┘ └────────┬────────┘   
                                                   │                  │            
                                                   │                  │            
                                    emit('search.synced')    emit('inventory.synced')
                                                   │                  │            
                                                   ▼                  ▼            
                                            ┌─────────────────────────────────┐    
                                            │       Product Service           │    
                                            │                                 │    
                                            │ @MessagePattern('*.synced')     │    
                                            │ Update Redis state              │    
                                            │ If all done → emit              │    
                                            │ 'noti.product.created'          │    
                                            └─────────────────────────────────┘    
```

**Cơ chế Sync State với Redis**:
```typescript
// Initial state
await this.redis.hset(`sync:${productId}`, {
  inventory: 'pending',
  search: 'pending',
});

// When inventory.synced received
await this.redis.hset(`sync:${productId}`, 'inventory', 'done');

// Check if all synced
const sync = await this.redis.hgetall(`sync:${productId}`);
if (sync.inventory === 'done' && sync.search === 'done') {
  this.kafka.emit('noti.product.created', { productId });
  await this.redis.del(`sync:${productId}`);
}
```

---

## 4. Hạ Tầng (Infrastructure)

### 4.1 Docker Compose Analysis

File `docker-compose.yml` định nghĩa toàn bộ hạ tầng với network name: **Click2Buy**

#### 4.1.1 Infrastructure Services

| Service | Image | Port (Host:Container) | Mô tả |
|---------|-------|----------------------|-------|
| **Zookeeper** | confluentinc/cp-zookeeper:7.6.0 | 22181:2181 | Coordination service cho Kafka |
| **Kafka** | confluentinc/cp-kafka:7.6.0 | 19092:9092 | Message broker chính |
| **MongoDB** | mongo:6 | 27027:27017 | Database chính |
| **Redis** | redis:7 | 6379:6379 | Cache và sync state |

#### 4.1.2 Kafka Configuration

```yaml
environment:
  KAFKA_BROKER_ID: 1
  KAFKA_ZOOKEEPER_CONNECT: click2buy_zookeeper:2181
  KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://click2buy_kafka:9092
  KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

**Lưu ý**: 
- Replication factor = 1 (single broker setup, chỉ phù hợp cho development)
- Internal network: `click2buy_kafka:9092`
- External access: `localhost:19092`

#### 4.1.3 Application Services

| Service | Container Name | Port (Host:Container) | Dependencies |
|---------|---------------|----------------------|--------------|
| api-gateway | click2buy_api-gateway | 3000:3000 | kafka, mongo |
| auth-service | click2buy_auth-service | 3101:3001 | kafka, mongo |
| user-service | click2buy_user-service | 3102:3002 | kafka, mongo |
| product-service | click2buy_product-service | 3103:3003 | kafka, mongo |
| cart-service | click2buy_cart-service | 3104:3004 | kafka, mongo |
| review-service | click2buy_review-service | 3105:3005 | kafka, mongo |
| payment-service | click2buy_payment-service | 3007:3007 | kafka, mongo |
| inventory-service | click2buy_inventory-service | 3108:3008 | kafka, mongo |
| order-service | click2buy_order-service | 3109:3009 | kafka, mongo |

#### 4.1.4 Volume Configuration

```yaml
volumes:
  click2buy_mongo_data:    # Persistent MongoDB data
  auth_node_modules:       # Cached node_modules per service
  user_node_modules:
  product_node_modules:
  cart_node_modules:
  review_node_modules:
  gateway_node_modules:
  payment_node_modules:
  inventory_node_modules:
  order_node_modules:
```

**Lợi ích**:
- MongoDB data persist qua restart
- node_modules cached → faster rebuild
- Source code mounted với `:delegated` → better performance trên macOS

#### 4.1.5 Development Mode Configuration

```yaml
environment:
  CHOKIDAR_USEPOLLING: "true"    # File watching trong Docker
  CHOKIDAR_INTERVAL: 500
  CHOKIDAR_DEPTH: 99

command: sh -c "npm install && npm run start:dev"
```

**Hot Reload**: Sử dụng Chokidar polling để detect file changes trong Docker volume

---

### 4.2 Network Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           click2buy_net (bridge)                                 │
│                                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   Zookeeper     │    │     Kafka       │    │    MongoDB      │              │
│  │ click2buy_      │◄───│ click2buy_      │    │ click2buy_      │              │
│  │ zookeeper:2181  │    │ kafka:9092      │    │ mongo:27017     │              │
│  └─────────────────┘    └────────┬────────┘    └────────┬────────┘              │
│                                  │                      │                        │
│                                  │                      │                        │
│  ┌───────────────────────────────┼──────────────────────┼───────────────────┐   │
│  │                               │                      │                   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌────┴────┐ ┌─────────┐ ┌───┴───┐ ┌─────────┐  │   │
│  │  │  Auth   │ │  User   │ │ Product │ │  Cart   │ │ Order │ │ Payment │  │   │
│  │  │ :3001   │ │ :3002   │ │ :3003   │ │ :3004   │ │ :3009 │ │ :3007   │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘ └─────────┘  │   │
│  │                                                                          │   │
│  │  ┌─────────┐ ┌───────────┐ ┌─────────────────────┐                      │   │
│  │  │ Review  │ │ Inventory │ │  Seller Analytics   │                      │   │
│  │  │ :3005   │ │ :3008     │ │                     │                      │   │
│  │  └─────────┘ └───────────┘ └─────────────────────┘                      │   │
│  │                                                                          │   │
│  │                         MICROSERVICES                                    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────┐                                                            │
│  │   API Gateway   │◄──────── External Access: localhost:3000                   │
│  │ click2buy_      │                                                            │
│  │ api-gateway:3000│                                                            │
│  └─────────────────┘                                                            │
│                                                                                  │
│  ┌─────────────────┐                                                            │
│  │     Redis       │                                                            │
│  │ click2buy_      │                                                            │
│  │ redis:6379      │                                                            │
│  └─────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Kafka Topics Summary

### 5.1 Request/Reply Topics (RPC)

| Topic | Producer | Consumer | Description |
|-------|----------|----------|-------------|
| `auth.login` | API Gateway | Auth Service | User login |
| `auth.register` | API Gateway | Auth Service | User registration |
| `auth.refresh` | API Gateway | Auth Service | Refresh access token |
| `auth.logout` | API Gateway | Auth Service | Logout & revoke token |
| `user.create` | Auth Service | User Service | Create new user |
| `user.getByforpasswordHash` | Auth Service | User Service | Get user with password |
| `user.findAll` | API Gateway | User Service | List users |
| `user.findOne` | API Gateway | User Service | Get user by ID |
| `user.update` | API Gateway | User Service | Update user |
| `product.create` | API Gateway | Product Service | Create product |
| `product.findAll` | API Gateway | Product Service | List products |
| `product.findOne` | API Gateway, Order Service | Product Service | Get product |
| `product.update` | API Gateway | Product Service | Update product |
| `product.remove` | API Gateway | Product Service | Delete product |
| `product.search` | API Gateway | Product Service | Search products |
| `cart.getAll` | API Gateway | Cart Service | Get user carts |
| `cart.add` | API Gateway | Cart Service | Add to cart |
| `cart.update` | API Gateway | Cart Service | Update cart item |
| `cart.remove` | API Gateway | Cart Service | Remove from cart |
| `order.create` | API Gateway | Order Service | Create order |
| `order.getAllOrderForSaller` | API Gateway | Order Service | Get seller orders |
| `review.*` | API Gateway | Review Service | Review CRUD |
| `inventory.getStock.request` | Product Service | Inventory Service | Get stock |
| `inventory.addStock` | Product Service | Inventory Service | Add stock |
| `inventory.adjustStock` | Product Service | Inventory Service | Adjust stock |

### 5.2 Event Topics (Pub/Sub)

| Topic | Producer | Consumers | Description |
|-------|----------|-----------|-------------|
| `order.created` | Order Service | Payment Service, Inventory Service | Order created event |
| `order.success` | Order Service | Inventory Service | Order completed |
| `order.confirmed` | Order Service | Seller Analytics | Order confirmed |
| `payment.success` | Payment Service | Order Service | Payment successful |
| `payment.cancelled` | Payment Service | Inventory Service | Payment failed/cancelled |
| `inventory.sync.requested` | Product Service | Inventory Service | Create inventory record |
| `inventory.synced` | Inventory Service | Product Service | Inventory sync done |
| `inventory.released` | Inventory Service | - | Stock released |
| `search.sync.requested` | Product Service | Search Service | Index product |
| `search.synced` | Search Service | Product Service | Search sync done |
| `cart.productDisabled` | Product Service | Cart Service | Product deleted |
| `noti.product.created` | Product Service | Notification Service | Product fully synced |

---

## 6. Authentication Flow

### 6.1 JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TOKEN ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   ACCESS TOKEN                          REFRESH TOKEN                            │
│   ─────────────                         ─────────────                            │
│   • Short-lived (5-100 min)             • Long-lived (30 days)                   │
│   • Stored in memory/localStorage       • Stored in HttpOnly Cookie              │
│   • Sent via Authorization header       • Sent automatically with requests       │
│   • Stateless verification              • Stored in MongoDB for revocation       │
│   • Contains: { sub, role }             • Contains: { sub, role }                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Token Refresh Flow

```
┌──────────┐                    ┌─────────────┐                    ┌─────────────┐
│  Client  │                    │ API Gateway │                    │Auth Service │
└────┬─────┘                    └──────┬──────┘                    └──────┬──────┘
     │                                 │                                  │
     │ POST /auth/refresh              │                                  │
     │ Cookie: refresh_token=xxx       │                                  │
     │────────────────────────────────►│                                  │
     │                                 │                                  │
     │                                 │ kafka.send('auth.refresh',       │
     │                                 │   { refreshToken })              │
     │                                 │─────────────────────────────────►│
     │                                 │                                  │
     │                                 │                    Verify token  │
     │                                 │                    Check DB      │
     │                                 │                    Generate new  │
     │                                 │                    access token  │
     │                                 │                                  │
     │                                 │◄─────────────────────────────────│
     │                                 │ { accessToken, refreshTokenInfo }│
     │                                 │                                  │
     │◄────────────────────────────────│                                  │
     │ { accessToken }                 │                                  │
     │ Set-Cookie: refresh_token=xxx   │                                  │
     │                                 │                                  │
```

### 6.3 JWT Guard trong Microservices

Mỗi service có `JwtKafkaAuthGuard` để verify token từ Kafka message:

```typescript
@UseGuards(JwtKafkaAuthGuard)
@MessagePattern('order.create')
async createOrders(@Payload() data: any, @CurrentUser() user: any) {
  const userId = user?.sub || user?.id;
  // ...
}
```

---

## 7. Hướng Dẫn Chạy Dự Án

### 7.1 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (cho local development)

### 7.2 Khởi Động

```bash
# Clone và vào thư mục
cd ecommerce-microservices

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f api-gateway
docker-compose logs -f order-service

# Dừng services
docker-compose down
```

### 7.3 Ports Summary

| Service | External Port | Internal Port |
|---------|--------------|---------------|
| API Gateway | 3000 | 3000 |
| Auth Service | 3101 | 3001 |
| User Service | 3102 | 3002 |
| Product Service | 3103 | 3003 |
| Cart Service | 3104 | 3004 |
| Review Service | 3105 | 3005 |
| Payment Service | 3007 | 3007 |
| Inventory Service | 3108 | 3008 |
| Order Service | 3109 | 3009 |
| MongoDB | 27027 | 27017 |
| Kafka | 19092 | 9092 |
| Zookeeper | 22181 | 2181 |
| Redis | 6379 | 6379 |

---

## 8. Lưu Ý Quan Trọng

### 8.1 Services Không Sử Dụng

- `timeout-service` - Code cũ, không còn sử dụng
- `status-service` - Code cũ, không còn sử dụng
- `media-service` - Đang bị comment out trong docker-compose

### 8.2 Limitations (Development Mode)

- Kafka single broker (replication factor = 1)
- Không có authentication cho MongoDB/Redis
- Không có SSL/TLS
- Không có rate limiting
- Không có circuit breaker

### 8.3 Recommendations cho Production

1. **Kafka**: Tăng replication factor, setup multiple brokers
2. **MongoDB**: Enable authentication, replica set
3. **Redis**: Enable authentication, cluster mode
4. **API Gateway**: Add rate limiting, circuit breaker
5. **Security**: Enable HTTPS, secure cookies
6. **Monitoring**: Add Prometheus, Grafana, ELK stack

---

*Tài liệu được tạo tự động từ phân tích mã nguồn - Ngày: 30/11/2025*
