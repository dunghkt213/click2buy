# Implementation Plan - Seller Dashboard Backend

- [ ] 1. Cập nhật Database Schema và Indexes
  - Thêm indexes cho products collection để tối ưu query theo ownerId
  - Thêm indexes cho orders collection để tối ưu query theo ownerId và sellerId
  - Tạo migration script để thêm trường sellerId vào order items hiện có
  - Cập nhật User schema với trường role và sellerInfo
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 1.1 Tạo indexes cho Products collection
  - Viết migration script tạo index `{ ownerId: 1, isActive: 1 }`
  - Viết migration script tạo index `{ ownerId: 1, stock: 1 }`
  - Viết migration script tạo index `{ ownerId: 1, createdAt: -1 }`
  - _Requirements: 1.2, 3.1_

- [ ] 1.2 Cập nhật Orders schema và indexes
  - Thêm trường sellerId vào OrderItem interface trong order.schema.ts
  - Viết migration script tạo index `{ ownerId: 1, status: 1 }`
  - Viết migration script tạo index `{ "items.sellerId": 1, createdAt: -1 }`
  - Viết migration script để populate sellerId cho order items hiện có từ products collection
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 1.3 Tạo Inventory Alerts collection
  - Tạo inventory-alert.schema.ts với các trường: productId, sellerId, currentStock, threshold, status
  - Tạo index `{ sellerId: 1, status: 1 }`
  - Tạo index `{ productId: 1, status: 1 }`
  - _Requirements: 3.4_

- [ ] 1.4 Cập nhật User schema
  - Thêm enum role: "buyer" | "seller" | "admin" vào user.schema.ts
  - Thêm nested object sellerInfo với businessName, taxId, phone, address
  - Tạo index `{ role: 1 }`
  - _Requirements: 5.4_

- [ ] 2. Implement Authentication và Authorization
  - Tạo SellerAuthGuard trong API Gateway để verify JWT và extract sellerId
  - Tạo OwnershipGuard trong Product Service và Order Service
  - Implement middleware inject sellerId vào request header
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 2.1 Tạo SellerAuthGuard trong API Gateway
  - Tạo file seller-auth.guard.ts trong api-gateway/src/guards/
  - Implement logic verify JWT token và check role === "seller"
  - Extract sellerId từ token payload
  - Inject sellerId vào request header x-seller-id
  - Throw 401 nếu token invalid, 403 nếu role không phải seller
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 2.2 Tạo OwnershipGuard cho Product Service
  - Tạo file ownership.guard.ts trong product-service/src/guards/
  - Implement logic đọc sellerId từ header x-seller-id
  - Implement method checkOwnership(resourceOwnerId, sellerId)
  - Throw 403 Forbidden nếu không match
  - _Requirements: 1.3, 1.4, 1.5, 5.5_

- [ ] 2.3 Tạo OwnershipGuard cho Order Service
  - Tạo file ownership.guard.ts trong order-service/src/guards/
  - Implement logic tương tự Product Service
  - Thêm logic đặc biệt cho multi-seller orders (check sellerId trong items array)
  - _Requirements: 2.2, 2.5, 5.5_

- [ ] 3. Implement Product Service - Seller APIs
  - Tạo SellerProductController với các endpoints CRUD sản phẩm
  - Implement business logic filter theo ownerId
  - Implement validation và error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.1 Tạo SellerProductController
  - Tạo file seller-product.controller.ts trong product-service/src/controllers/
  - Implement POST /seller/products endpoint với auto-set ownerId từ sellerId
  - Implement GET /seller/products với pagination và filter theo ownerId
  - Implement GET /seller/products/:id với ownership check
  - Implement PATCH /seller/products/:id với ownership check
  - Implement DELETE /seller/products/:id với ownership check và stock validation
  - Apply OwnershipGuard cho tất cả endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.2 Tạo DTOs cho Seller Product APIs
  - Tạo create-seller-product.dto.ts (không có ownerId trong input)
  - Tạo update-seller-product.dto.ts
  - Tạo query-seller-product.dto.ts với page, limit, search, isActive
  - Thêm validation decorators từ class-validator
  - _Requirements: 1.1, 1.2_

- [ ]* 3.3 Viết unit tests cho SellerProductController
  - Test POST endpoint tự động set ownerId
  - Test GET endpoints filter đúng theo sellerId
  - Test ownership validation cho UPDATE và DELETE
  - Test error cases: 403 Forbidden, 404 Not Found, 409 Conflict
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4. Implement Inventory Management APIs
  - Tạo SellerInventoryController trong Product Service
  - Implement logic cập nhật stock và publish Kafka events
  - Implement logic auto-disable product khi stock = 0
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.1 Tạo SellerInventoryController
  - Tạo file seller-inventory.controller.ts trong product-service/src/controllers/
  - Implement GET /seller/inventory với filter theo ownerId
  - Implement GET /seller/inventory?lowStock=true để filter stock < 10
  - Implement PATCH /seller/inventory/:productId để update stock
  - Support operations: "set", "increment", "decrement"
  - _Requirements: 3.1, 3.2_

- [ ] 4.2 Implement InventoryService với Kafka integration
  - Tạo file inventory.service.ts trong product-service/src/services/
  - Implement updateStock method với ownership check
  - Implement logic: nếu stock === 0, set isActive = false
  - Implement logic: nếu stock < 10, publish inventory.low event
  - Publish inventory.updated event sau mỗi lần update
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 4.3 Tạo Kafka Producer cho Inventory Events
  - Tạo file inventory-event.producer.ts trong product-service/src/kafka/
  - Implement publishInventoryUpdated method
  - Implement publishInventoryLow method
  - Event payload bao gồm: eventId, timestamp, pattern, data
  - _Requirements: 3.2, 3.4, 6.3, 6.5_

- [ ]* 4.4 Viết unit tests cho Inventory logic
  - Test update stock với các operations khác nhau
  - Test auto-disable khi stock = 0
  - Test publish inventory.low event khi stock < 10
  - Mock Kafka producer
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Implement Order Service - Seller APIs
  - Tạo SellerOrderController với endpoints xem và cập nhật đơn hàng
  - Implement logic filter orders theo sellerId
  - Implement status update với Kafka events
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.1 Tạo SellerOrderController
  - Tạo file seller-order.controller.ts trong order-service/src/controllers/
  - Implement GET /seller/orders với pagination và filter theo ownerId hoặc items.sellerId
  - Implement query params: status, startDate, endDate, page, limit
  - Implement GET /seller/orders/:id với ownership check
  - Filter items để chỉ trả về items thuộc seller
  - _Requirements: 2.1, 2.2_

- [ ] 5.2 Implement Order Status Update
  - Thêm PATCH /seller/orders/:id/status endpoint vào SellerOrderController
  - Implement status validation: chỉ cho phép transitions hợp lệ
  - Implement ownership check trước khi update
  - Update order status trong database
  - _Requirements: 2.3, 2.4_

- [ ] 5.3 Tạo Kafka Producer cho Order Events
  - Tạo file order-event.producer.ts trong order-service/src/kafka/
  - Implement publishOrderStatusUpdated method
  - Implement publishOrderShipped method với items info
  - Event payload bao gồm: eventId, timestamp, pattern, data (orderId, sellerId, items)
  - _Requirements: 2.3, 2.4, 6.1, 6.5_

- [ ] 5.4 Implement Multi-Seller Order Support
  - Update OrderService để handle orders với nhiều sellers
  - Implement logic cho phép mỗi seller chỉ update status của items thuộc họ
  - Tạo sub-status cho từng seller trong order
  - _Requirements: 2.5_

- [ ]* 5.5 Viết unit tests cho SellerOrderController
  - Test GET orders filter đúng theo sellerId
  - Test ownership validation
  - Test status update và Kafka event publishing
  - Test multi-seller order scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6. Implement Kafka Event Consumers
  - Tạo consumer trong Product Service để lắng nghe order.shipped events
  - Implement logic tự động trừ stock khi nhận event
  - Implement error handling và retry logic
  - _Requirements: 3.3, 6.2, 6.4_

- [ ] 6.1 Tạo OrderEventConsumer trong Product Service
  - Tạo file order-event.consumer.ts trong product-service/src/kafka/
  - Subscribe vào topic "order-events"
  - Implement handler cho pattern "order.shipped"
  - Extract items từ event payload
  - _Requirements: 6.2_

- [ ] 6.2 Implement Stock Decrement Logic
  - Trong OrderEventConsumer, loop qua items array
  - Gọi ProductService.decrementStock(productId, quantity) cho mỗi item
  - Implement atomic update với MongoDB $inc operator
  - Check stock sau khi decrement, nếu = 0 thì set isActive = false
  - _Requirements: 3.3, 3.5_

- [ ] 6.3 Implement Event Idempotency
  - Tạo event_processed collection để track processed eventIds
  - Trước khi xử lý event, check eventId đã tồn tại chưa
  - Nếu đã xử lý, skip event
  - Nếu chưa, xử lý và lưu eventId vào collection
  - _Requirements: 6.4_

- [ ] 6.4 Implement Error Handling và Retry
  - Wrap event processing trong try-catch
  - Log error vào event_failures collection với eventId, error message, timestamp
  - Implement exponential backoff retry (3 lần)
  - Nếu retry thất bại, move event vào Dead Letter Queue
  - _Requirements: 6.4_

- [ ]* 6.5 Viết integration tests cho Kafka flow
  - Test publish và consume order.shipped event
  - Test stock được trừ đúng
  - Test idempotency: consume cùng event 2 lần không trừ stock 2 lần
  - Test retry logic khi processing thất bại
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7. Implement Analytics và Dashboard APIs
  - Tạo SellerAnalyticsController trong Order Service
  - Implement revenue statistics với aggregation
  - Implement top products query
  - Implement dashboard overview
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.1 Tạo SellerAnalyticsController
  - Tạo file seller-analytics.controller.ts trong order-service/src/controllers/
  - Implement GET /seller/analytics/revenue endpoint
  - Query params: startDate, endDate, groupBy (day/week/month)
  - Aggregate orders theo ownerId và time period
  - Return totalRevenue, totalOrders, averageOrderValue, breakdown array
  - _Requirements: 4.1, 4.3_

- [ ] 7.2 Implement Top Products Analytics
  - Thêm GET /seller/analytics/top-products endpoint
  - Query params: limit (default 10), startDate, endDate
  - Aggregate order items theo productId và sellerId
  - Calculate totalSold và revenue cho mỗi product
  - Sort by totalSold descending
  - _Requirements: 4.2_

- [ ] 7.3 Implement Dashboard Overview
  - Thêm GET /seller/dashboard/overview endpoint
  - Query metrics từ Product Service: totalProducts, activeProducts, lowStockProducts
  - Query metrics từ Order Service: totalOrders, pendingOrders, totalRevenue, revenueThisMonth
  - Có thể dùng HTTP call hoặc Kafka request-reply pattern
  - Aggregate và return combined metrics
  - _Requirements: 4.4_

- [ ] 7.4 Implement Caching cho Dashboard Overview
  - Integrate Redis vào Order Service
  - Cache dashboard overview với key: `dashboard:${sellerId}`
  - Set TTL = 5 minutes
  - Invalidate cache khi có order status update
  - _Requirements: 4.4_

- [ ]* 7.5 Viết unit tests cho Analytics APIs
  - Test revenue calculation với different time periods
  - Test top products aggregation
  - Test dashboard overview data aggregation
  - Mock external service calls
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Tạo Inventory Service (Service mới)
  - Setup NestJS project structure cho inventory-service
  - Implement Kafka consumer cho inventory events
  - Implement alerts management
  - _Requirements: 3.4_

- [ ] 8.1 Setup Inventory Service Project
  - Tạo folder ecommerce-microservices/inventory-service
  - Copy Dockerfile và package.json từ service khác
  - Setup NestJS với @nestjs/microservices và kafkajs
  - Tạo app.module.ts với MongoDB và Kafka connections
  - Update docker-compose.yml để thêm inventory-service (port 3107)
  - _Requirements: 3.4_

- [ ] 8.2 Implement Inventory Alert Consumer
  - Tạo inventory-alert.consumer.ts
  - Subscribe vào topic "inventory-events"
  - Implement handler cho pattern "inventory.low"
  - Tạo alert record trong inventory_alerts collection
  - _Requirements: 3.4_

- [ ] 8.3 Implement Inventory Alert APIs
  - Tạo inventory-alert.controller.ts
  - Implement GET /seller/inventory/alerts để lấy active alerts
  - Implement PATCH /seller/inventory/alerts/:id/resolve để mark alert as resolved
  - Filter alerts theo sellerId
  - _Requirements: 3.4_

- [ ]* 8.4 Viết tests cho Inventory Service
  - Test Kafka consumer tạo alerts đúng
  - Test GET alerts filter theo sellerId
  - Test resolve alert functionality
  - _Requirements: 3.4_

- [ ] 9. Update API Gateway Routing
  - Thêm routes cho seller endpoints
  - Apply SellerAuthGuard cho tất cả /seller/* routes
  - Configure proxy đến các microservices
  - _Requirements: 5.1, 5.2_

- [ ] 9.1 Thêm Seller Routes vào API Gateway
  - Update api-gateway/src/app.controller.ts hoặc tạo seller.controller.ts
  - Thêm routes: /seller/products/*, /seller/orders/*, /seller/inventory/*, /seller/analytics/*
  - Apply @UseGuards(SellerAuthGuard) cho tất cả routes
  - Configure HTTP proxy hoặc microservice client để forward requests
  - _Requirements: 5.1, 5.2_

- [ ] 9.2 Configure Service Discovery
  - Update .env files với service URLs
  - Implement HttpService hoặc ClientProxy để gọi microservices
  - Handle service unavailable errors
  - _Requirements: 5.1_

- [ ]* 9.3 Viết integration tests cho API Gateway
  - Test authentication flow với valid/invalid tokens
  - Test authorization với seller/non-seller roles
  - Test request forwarding đến đúng services
  - Test error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Database Migration Scripts
  - Viết scripts để migrate data hiện có
  - Populate sellerId cho order items
  - Tạo indexes
  - _Requirements: 1.2, 2.5_

- [ ] 10.1 Tạo Migration Script cho Order Items
  - Tạo file scripts/migrate-order-items-seller-id.js
  - Query tất cả orders
  - Với mỗi order, loop qua items
  - Lookup productId trong products collection để lấy ownerId
  - Update order item với sellerId = ownerId
  - Log progress và errors
  - _Requirements: 2.5_

- [ ] 10.2 Tạo Migration Script cho Indexes
  - Tạo file scripts/create-indexes.js
  - Tạo tất cả indexes đã define trong design document
  - Check index đã tồn tại trước khi tạo
  - Log kết quả
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 10.3 Tạo Seed Data cho Testing
  - Tạo file scripts/seed-seller-data.js
  - Tạo sample seller users
  - Tạo sample products với ownerId
  - Tạo sample orders với sellerId trong items
  - _Requirements: 5.4_

- [ ]* 10.4 Test Migration Scripts
  - Test trên local MongoDB instance
  - Verify data integrity sau migration
  - Test rollback scripts
  - _Requirements: 1.2, 2.5_

- [ ] 11. Documentation và Deployment
  - Viết API documentation với Swagger
  - Update README với setup instructions
  - Tạo Postman collection cho Seller APIs
  - Deploy lên staging environment
  - _Requirements: All_

- [ ] 11.1 Tạo Swagger Documentation
  - Thêm @nestjs/swagger vào các services
  - Annotate controllers với @ApiTags, @ApiOperation, @ApiResponse
  - Annotate DTOs với @ApiProperty
  - Generate Swagger UI tại /api/docs
  - _Requirements: All_

- [ ] 11.2 Update README và Documentation
  - Document Seller Dashboard architecture
  - Document API endpoints với examples
  - Document Kafka events và topics
  - Document database schema changes
  - Document setup và deployment instructions
  - _Requirements: All_

- [ ] 11.3 Tạo Postman Collection
  - Export existing Click2Buy.postman_collection.json
  - Thêm folder "Seller APIs"
  - Thêm requests cho tất cả seller endpoints
  - Setup environment variables cho seller token
  - _Requirements: All_

- [ ]* 11.4 E2E Testing
  - Viết E2E test cho seller journey: Create product → Receive order → Update status → Check inventory
  - Test multi-seller order scenario
  - Test Kafka event flow end-to-end
  - _Requirements: All_

- [ ] 11.5 Deployment Preparation
  - Update docker-compose.yml với inventory-service
  - Update .env.example files
  - Test docker-compose up locally
  - Prepare deployment scripts cho staging
  - _Requirements: All_
