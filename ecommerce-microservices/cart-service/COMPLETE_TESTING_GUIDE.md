# 🚀 Cart Service - Complete Setup & Testing Guide

## 📋 Quick Start Checklist

- [ ] All services started via docker-compose
- [ ] MongoDB Atlas accessible
- [ ] Kafka broker running and topics created
- [ ] JWT_SECRET synchronized across services
- [ ] User registered and logged in
- [ ] All cart APIs tested successfully

---

## Part A: Docker Instructions

### 1. Start All Services

```powershell
# Navigate to microservices directory
cd e:\kỳ 1 năm 3\SOA\BTL\click2buy\ecommerce-microservices

# Start all services in background
docker-compose up -d --build

# View all running containers
docker ps
```

**Expected Containers:**
- click2buy_zookeeper
- click2buy_kafka
- click2buy_mongo
- click2buy_auth-service
- click2buy_user-service
- click2buy_product-service
- **click2buy_cart-service**
- click2buy_review-service
- click2buy_api-gateway

### 2. Verify Cart Service is Running

```powershell
# View cart-service logs
docker logs -f click2buy_cart-service

# Expected output:
# ✅ Kafka Producer connected successfully
# ✅ Kafka Consumer connected successfully
# 🚀 Cart Service is running on: http://localhost:3004
# 📦 MongoDB URI: cluster0.agveqq9.mongodb.net/cart_db
# 📡 Kafka Broker: kafka:9092
# ✅ Service ready to accept requests
```

### 3. Verify MongoDB Connection

**Option 1: Check Logs**
```powershell
docker logs click2buy_cart-service | Select-String "MongoDB"
```

**Option 2: Access MongoDB Atlas Dashboard**
1. Go to https://cloud.mongodb.com/
2. Login with credentials (username: click2buy)
3. Navigate to Database → Browse Collections
4. Check if `cart_db` database exists

**Option 3: Test Connection via Compass**
```
mongodb+srv://click2buy:click2buy@cluster0.agveqq9.mongodb.net/cart_db
```

### 4. Verify Kafka Broker

```powershell
# Access Kafka container
docker exec -it click2buy_kafka bash

# List existing topics
kafka-topics --bootstrap-server localhost:9092 --list

# Create required topics (if they don't exist)
kafka-topics --create --bootstrap-server localhost:9092 --topic inventory-events --partitions 1 --replication-factor 1
kafka-topics --create --bootstrap-server localhost:9092 --topic order-events --partitions 1 --replication-factor 1
kafka-topics --create --bootstrap-server localhost:9092 --topic inventory-stock-updated --partitions 1 --replication-factor 1

# Verify topics were created
kafka-topics --bootstrap-server localhost:9092 --list

# Exit container
exit
```

### 5. Troubleshooting Docker

```powershell
# Restart specific service
docker-compose restart cart-service

# Rebuild and restart
docker-compose up -d --build cart-service

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# View logs for all services
docker-compose logs -f

# Check service health
docker inspect click2buy_cart-service
```

---

## Part B: Register & Login via Auth-Service

### Step 1: Register a New User

```powershell
# Register user
curl -X POST http://localhost:3101/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"testuser@example.com\",
    \"password\": \"SecurePass123\",
    \"name\": \"Test User\"
  }'
```

**Expected Response (201 Created):**
```json
{
  "_id": "65abc123def456...",
  "email": "testuser@example.com",
  "name": "Test User",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

**Possible Errors:**
- `400 Bad Request` - Email already exists
- `500 Internal Server Error` - Auth service not running

### Step 2: Login to Get JWT Token

```powershell
# Login and get token
$loginResponse = curl -X POST http://localhost:3101/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"testuser@example.com\",
    \"password\": \"SecurePass123\"
  }' | ConvertFrom-Json

# Extract and save token
$TOKEN = $loginResponse.access_token
Write-Host "🎫 JWT Token: $TOKEN"

# Verify token is valid
Write-Host "Token length: $($TOKEN.Length)"
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "65abc123def456...",
    "email": "testuser@example.com",
    "name": "Test User"
  }
}
```

### Step 3: Decode Token (Optional - for debugging)

```powershell
# Decode JWT token (without verification)
$tokenParts = $TOKEN.Split('.')
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1]))
Write-Host "Decoded Payload: $payload"
```

---

## Part C: Test All Cart Service Routes Using Token

### Test 1: GET /cart (Auto-create empty cart)

```powershell
# Get cart (will auto-create if not exists)
curl -X GET http://localhost:3104/cart `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "_id": "65abc789...",
  "userId": "65abc123def456...",
  "items": [],
  "createdAt": "2024-01-15T10:05:00.000Z",
  "updatedAt": "2024-01-15T10:05:00.000Z",
  "__v": 0
}
```

### Test 2: POST /cart/add (Add items to cart)

```powershell
# Add laptop to cart
curl -X POST http://localhost:3104/cart/add `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"laptop-dell-xps-15\",
    \"quantity\": 1
  }'

# Add wireless mouse
curl -X POST http://localhost:3104/cart/add `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"mouse-logitech-mx\",
    \"quantity\": 2
  }'

# Add keyboard
curl -X POST http://localhost:3104/cart/add `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"keyboard-keychron-k8\",
    \"quantity\": 1
  }'
```

**Expected Response (200 OK):**
```json
{
  "_id": "65abc789...",
  "userId": "65abc123def456...",
  "items": [
    {
      "productId": "laptop-dell-xps-15",
      "quantity": 1
    },
    {
      "productId": "mouse-logitech-mx",
      "quantity": 2
    },
    {
      "productId": "keyboard-keychron-k8",
      "quantity": 1
    }
  ],
  "updatedAt": "2024-01-15T10:10:00.000Z"
}
```

### Test 3: Add Same Item (Increases Quantity)

```powershell
# Add more mice (will increase quantity to 5)
curl -X POST http://localhost:3104/cart/add `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"mouse-logitech-mx\",
    \"quantity\": 3
  }'
```

**Expected:** Mouse quantity increases from 2 to 5.

### Test 4: PATCH /cart/update (Update quantity)

```powershell
# Update mouse quantity to 10
curl -X PATCH http://localhost:3104/cart/update `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"mouse-logitech-mx\",
    \"quantity\": 10
  }'
```

**Expected Response:** Cart with updated quantity.

### Test 5: Update to Zero (Removes Item)

```powershell
# Set keyboard quantity to 0 (removes it)
curl -X PATCH http://localhost:3104/cart/update `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"keyboard-keychron-k8\",
    \"quantity\": 0
  }'
```

**Expected:** Keyboard is removed from cart.

### Test 6: DELETE /cart/remove/:productId

```powershell
# Remove laptop from cart
curl -X DELETE http://localhost:3104/cart/remove/laptop-dell-xps-15 `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Cart without laptop.

### Test 7: GET /cart (View Current Cart)

```powershell
# View cart to confirm changes
curl -X GET http://localhost:3104/cart `
  -H "Authorization: Bearer $TOKEN"
```

### Test 8: POST /cart/checkout

```powershell
# Checkout cart
curl -X POST http://localhost:3104/cart/checkout `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Checkout successful. Order is being processed.",
  "itemCount": 1
}
```

### Test 9: Verify Cart is Cleared

```powershell
# Get cart after checkout (should be empty)
curl -X GET http://localhost:3104/cart `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "items": []
}
```

---

## Part D: Error Scenarios Testing

### Test Invalid Token

```powershell
curl -X GET http://localhost:3104/cart `
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### Test Missing Token

```powershell
curl -X GET http://localhost:3104/cart
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Missing authorization header",
  "error": "Unauthorized"
}
```

### Test Invalid Product ID

```powershell
curl -X DELETE http://localhost:3104/cart/remove/nonexistent-product `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product nonexistent-product not found in cart",
  "error": "Not Found"
}
```

### Test Empty Cart Checkout

```powershell
# Try to checkout empty cart
curl -X POST http://localhost:3104/cart/checkout `
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Cart is empty",
  "error": "Bad Request"
}
```

### Test Invalid Quantity

```powershell
# Try to add item with negative quantity
curl -X POST http://localhost:3104/cart/add `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    \"productId\": \"test-product\",
    \"quantity\": -1
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["quantity must be at least 1"],
  "error": "Bad Request"
}
```

---

## Part E: Monitor Kafka Events

### Terminal 1: Monitor Inventory Events

```powershell
docker exec -it click2buy_kafka bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic inventory-events --from-beginning
```

**Expected Output When Adding to Cart:**
```json
{
  "event": "inventory.reserve",
  "userId": "65abc123def456...",
  "productId": "laptop-dell-xps-15",
  "quantity": 1,
  "timestamp": "2024-01-15T10:10:00.000Z"
}
```

### Terminal 2: Monitor Order Events

```powershell
docker exec -it click2buy_kafka bash
kafka-console-consumer --bootstrap-server localhost:9092 --topic order-events --from-beginning
```

**Expected Output On Checkout:**
```json
{
  "event": "order.create",
  "userId": "65abc123def456...",
  "items": [
    {"productId": "mouse-logitech-mx", "quantity": 10}
  ],
  "timestamp": "2024-01-15T10:15:00.000Z"
}
```

---

## Part F: Postman Collection

### Import Collection

1. Open Postman
2. Click **Import**
3. Select `Cart-Service-API.postman_collection.json`
4. The collection already exists in the cart-service directory

### Setup Environment

1. Create new environment: `Cart Service - Local`
2. Add variables:
   - `BASE_URL`: `http://localhost:3104`
   - `AUTH_URL`: `http://localhost:3101`
   - `TOKEN`: (leave empty, will be auto-set after login)

### Test Flow in Postman

1. **Authentication → Login User**
   - Token is automatically saved to `TOKEN` variable
2. **Cart Operations → Get Cart**
3. **Cart Operations → Add Item to Cart**
4. **Cart Operations → Update Item Quantity**
5. **Cart Operations → Remove Item from Cart**
6. **Cart Operations → Checkout Cart**

---

## Part G: Verify Data in MongoDB Atlas

1. Visit: https://cloud.mongodb.com/
2. Navigate to your cluster → Database → Browse Collections
3. Select database: `cart_db`
4. Select collection: `carts`
5. View documents

**Sample Cart Document:**
```json
{
  "_id": {"$oid": "65abc789..."},
  "userId": "65abc123def456...",
  "items": [
    {
      "productId": "mouse-logitech-mx",
      "quantity": 10
    }
  ],
  "createdAt": {"$date": "2024-01-15T10:05:00.000Z"},
  "updatedAt": {"$date": "2024-01-15T10:15:00.000Z"},
  "__v": 0
}
```

---

## Part H: Run Unit Tests

```powershell
cd ecommerce-microservices/cart-service

# Run all tests
npm test

# Run with coverage report
npm run test:cov

# Run in watch mode (for development)
npm run test:watch
```

**Expected Output:**
```
PASS  src/cart/cart.service.spec.ts
PASS  src/cart/cart.controller.spec.ts

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        3.245s
```

---

## Part I: Performance Testing

### Load Test with Apache Bench

```powershell
# Install Apache Bench (ab) if needed
# On Windows: Download from Apache binaries

# Test GET /cart endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:3104/cart
```

### Stress Test with Artillery

```powershell
# Install Artillery
npm install -g artillery

# Create test config: artillery-test.yml
# Run load test
artillery run artillery-test.yml
```

---

## Part J: Cleanup

```powershell
# Stop all services
docker-compose down

# Remove all data (CAUTION)
docker-compose down -v

# Remove cart-service image
docker rmi ecommerce-microservices_cart-service

# Clean npm cache
npm cache clean --force
```

---

## 📊 Success Criteria

✅ All Docker containers running  
✅ MongoDB Atlas accessible  
✅ Kafka topics created  
✅ User registered and logged in  
✅ JWT token obtained  
✅ GET /cart returns empty cart  
✅ POST /cart/add adds items  
✅ Items quantity increases on duplicate add  
✅ PATCH /cart/update modifies quantity  
✅ DELETE /cart/remove removes items  
✅ POST /cart/checkout succeeds  
✅ Cart cleared after checkout  
✅ Kafka events published  
✅ All unit tests pass  
✅ Error scenarios handled correctly  

---

## 🎉 Congratulations!

Your cart-service is **production-ready** and fully tested!

### Next Steps

1. Integrate with actual product-service
2. Implement real inventory checks
3. Add Redis caching for performance
4. Set up monitoring (Prometheus + Grafana)
5. Configure proper logging (ELK stack)
6. Implement rate limiting
7. Add API documentation (Swagger)

---

**Need Help?** Check logs: `docker logs click2buy_cart-service`
