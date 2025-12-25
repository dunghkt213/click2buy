# API DOCUMENTATION FOR FRONTEND
## Click2Buy E-commerce Platform - AI Integration & Chat Service

**Version:** 1.0  
**Date:** December 19, 2024  
**Base URL:** `http://localhost:3000` (API Gateway)

---

## 📋 TABLE OF CONTENTS

1. [AI Content Moderation](#1-ai-content-moderation)
2. [AI Image Moderation](#2-ai-image-moderation)
3. [AI Review Summary](#3-ai-review-summary)
4. [AI Duplicate Product Detection](#4-ai-duplicate-product-detection)
5. [Chat Service (WebSocket)](#5-chat-service-websocket)
6. [Chat Service (HTTP APIs)](#6-chat-service-http-apis)
7. [Error Handling](#7-error-handling)
8. [Authentication](#8-authentication)
9. [Product Search By Image](#13-product-search-by-image)

---

## 1. AI CONTENT MODERATION

### Overview
AI tự động kiểm duyệt nội dung text (review, comment) để chặn spam, nội dung độc hại.

### 1.1 Create Review with AI Moderation

**Endpoint:** `POST /reviews`  
**Authentication:** Required (Bearer Token)  
**AI Guard:** Tự động kiểm duyệt `content` field

```typescript
// Request
interface CreateReviewRequest {
  productId: string;
  rating: number; // 1-5
  content?: string; // Sẽ được AI kiểm duyệt
  images?: string[]; // URL hoặc Base64
}

// Example
const response = await fetch('/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    productId: '64fa123...',
    rating: 5,
    content: 'Sản phẩm rất tốt, chất lượng cao!'
  })
});
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "_id": "64fb456...",
    "productId": "64fa123...",
    "rating": 5,
    "content": "Sản phẩm rất tốt, chất lượng cao!",
    "userId": "64f789...",
    "createdAt": "2024-12-19T10:30:00.000Z"
  }
}
```

**AI Blocked Response (400):**
```json
{
  "message": "Nội dung vi phạm tiêu chuẩn cộng đồng",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 1.2 AI Moderation Rules

**BLOCKED Content:**
- Spam: Nội dung lặp lại vô nghĩa
- Advertising: Link, số điện thoại, quảng cáo
- Offensive: Ngôn ngữ thô tục, chửi bới
- Harmful: Thông tin sai lệch nguy hiểm

**ALLOWED Content:**
- Đánh giá sản phẩm bình thường
- Chia sẻ trải nghiệm sử dụng
- Góp ý xây dựng

---

## 2. AI IMAGE MODERATION

### Overview
AI tự động kiểm duyệt hình ảnh (sản phẩm, review) để chặn nội dung không phù hợp.

### 2.1 Create Product with Image Moderation

**Endpoint:** `POST /products`  
**Authentication:** Required (Seller role)  
**AI Guard:** Tự động kiểm duyệt `images` field

```typescript
// Request
interface CreateProductRequest {
  name: string;
  price: number;
  description?: string;
  images?: string[]; // URL hoặc Base64 - sẽ được AI kiểm duyệt
  brand?: string;
  stock: number;
}

// Example với URL
const response = await fetch('/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sellerToken}`
  },
  body: JSON.stringify({
    name: 'Laptop Gaming',
    price: 25000000,
    description: 'Laptop gaming cao cấp',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'
    ],
    stock: 10
  })
});
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64fa123...",
    "name": "Laptop Gaming",
    "price": 25000000,
    "images": ["https://images.unsplash.com/..."],
    "sellerId": "64f789...",
    "createdAt": "2024-12-19T10:30:00.000Z"
  }
}
```

**AI Blocked Response (400):**
```json
{
  "message": "Ảnh sản phẩm #1 vi phạm chính sách nội dung. Vui lòng sử dụng ảnh khác.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### 2.2 Supported Image Formats

**URL Images:**
```javascript
images: [
  'https://example.com/image1.jpg',
  'https://example.com/image2.png'
]
```

**Base64 Images:**
```javascript
images: [
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...'
]
```

### 2.3 Image Field Names Supported

AI Guard tự động kiểm tra các field sau:
- `images` (array) - **Recommended**
- `image` (string)
- `imageUrl` (string)
- `imageUrls` (array)
- `photos` (array)
- `photo` (string)

---

## 3. AI REVIEW SUMMARY

### Overview
AI tự động tóm tắt tất cả review của sản phẩm thành 2-3 câu ngắn gọn.

### 3.1 Get Product with AI Summary

**Endpoint:** `GET /products/:productId`  
**Authentication:** Not required

```typescript
// Request
const response = await fetch(`/products/${productId}`);
const product = await response.json();

// Response
interface ProductResponse {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  reviewSummary?: string; // AI-generated summary
  averageRating?: number;
  totalReviews?: number;
  // ... other fields
}
```

**Example Response:**
```json
{
  "_id": "64fa123...",
  "name": "Laptop Gaming ASUS",
  "price": 25000000,
  "description": "Laptop gaming cao cấp",
  "reviewSummary": "Sản phẩm được đánh giá cao về hiệu năng chơi game và màn hình đẹp. Một số người dùng phản ánh máy hơi nóng khi sử dụng lâu. Nhìn chung phù hợp cho nhu cầu gaming và làm việc.",
  "averageRating": 4.2,
  "totalReviews": 15,
  "images": ["https://..."],
  "createdAt": "2024-12-19T10:30:00.000Z"
}
```

### 3.2 AI Summary Behavior

**When Summary is Generated:**
- Tự động sau khi có review mới được tạo
- Xử lý bất đồng bộ (async), không block API response
- Cập nhật trong vòng 2-5 giây

**Summary Content:**
- Ngôn ngữ: Tiếng Việt
- Độ dài: 2-3 câu
- Nội dung: Tóm tắt ưu nhược điểm chính từ review

**Edge Cases:**
- Không có review: `reviewSummary: null`
- Review quá ngắn: `reviewSummary: null`
- AI lỗi: `reviewSummary` giữ nguyên giá trị cũ

---

## 4. AI DUPLICATE PRODUCT DETECTION

### Overview
AI tự động phát hiện sản phẩm trùng lặp khi seller tạo sản phẩm mới.

### 4.1 Create Product with Duplicate Check

**Endpoint:** `POST /products`  
**Authentication:** Required (Seller role)  
**AI Guard:** Tự động so sánh với sản phẩm cũ của cùng seller

```typescript
// Request (same as normal product creation)
const response = await fetch('/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sellerToken}`
  },
  body: JSON.stringify({
    name: 'iPhone 15 Pro Max',
    description: 'Điện thoại iPhone 15 Pro Max 256GB màu xanh',
    price: 30000000,
    brand: 'Apple',
    stock: 5
  })
});
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64fa123...",
    "name": "iPhone 15 Pro Max",
    "description": "Điện thoại iPhone 15 Pro Max 256GB màu xanh",
    // ... other fields
  }
}
```

**Duplicate Detected Response (400):**
```json
{
  "message": "Sản phẩm tương tự đã tồn tại trong cửa hàng của bạn. Vui lòng kiểm tra lại hoặc cập nhật sản phẩm hiện có.",
  "error": "Bad Request",
  "statusCode": 400,
  "duplicateProductId": "64f789..." // ID của sản phẩm trùng lặp
}
```

### 4.2 Duplicate Detection Rules

**Similarity Threshold:** 80%

**Comparison Factors:**
- Product name
- Description
- Brand
- Category
- Specifications

**Only compares with:** Products from the same seller

---

## 5. CHAT SERVICE (WEBSOCKET)

### Overview
Real-time chat giữa buyer và seller với AI content moderation.

### 5.1 WebSocket Connection

**Namespace:** `/chat`  
**URL:** `ws://localhost:3000/chat`

```typescript
import { io, Socket } from 'socket.io-client';

// Connect with userId
const socket: Socket = io('http://localhost:3000/chat', {
  query: { userId: 'user123' },
  transports: ['websocket']
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('connected', (data) => {
  console.log('Server confirmed:', data.message);
  // Response: { message: 'Kết nối thành công', socketId: '...', timestamp: '...' }
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### 5.2 Send Message

```typescript
// Send message
socket.emit('send_message', {
  content: 'Xin chào shop, sản phẩm này còn hàng không?',
  receiverId: 'seller456',
  conversationId?: 'optional-conversation-id'
});

// Listen for confirmations
socket.on('message_sent', (data) => {
  console.log('Message sent successfully:', data);
  // Response: { id, content, senderId, receiverId, timestamp, status: 'sent' }
});

// Listen for blocked messages
socket.on('message_blocked', (data) => {
  console.log('Message blocked:', data.message);
  // Response: { code: 'CONTENT_VIOLATION', message: 'Tin nhắn vi phạm...', timestamp }
});
```

### 5.3 Receive Messages

```typescript
// Listen for incoming messages
socket.on('receive_message', (message) => {
  console.log('New message:', message);
  // Response: { id, content, senderId, receiverId, conversationId?, timestamp }
  
  // Update UI with new message
  addMessageToChat(message);
});
```

### 5.4 Typing Indicator

```typescript
// Send typing status
socket.emit('typing', {
  receiverId: 'seller456',
  isTyping: true
});

// Listen for typing status
socket.on('user_typing', (data) => {
  console.log(`${data.senderId} is typing:`, data.isTyping);
  // Show/hide typing indicator in UI
});
```

### 5.5 Join Conversation

```typescript
// Join specific conversation room
socket.emit('join_conversation', {
  conversationId: '64fa123...'
});

socket.on('joined_conversation', (data) => {
  console.log('Joined conversation:', data.conversationId);
});
```

### 5.6 Get Chat History

```typescript
// Get conversations list
socket.emit('get_conversations', {
  userId: 'user123' // Optional, defaults to connected user
});

socket.on('conversations_list', (result) => {
  if (result.success) {
    console.log('Conversations:', result.data);
    // result.data: Array of conversations with participants, lastMessage, etc.
  }
});

// Get messages history
socket.emit('get_messages', {
  conversationId: '64fa123...',
  limit: 50, // Optional, default 50
  skip: 0    // Optional, for pagination
});

socket.on('messages_history', (result) => {
  if (result.success) {
    console.log('Messages:', result.data);
    console.log('Pagination:', result.pagination);
  }
});
```

### 5.7 Start New Conversation

```typescript
// Find or create conversation with another user
socket.emit('start_conversation', {
  targetUserId: 'seller456'
});

socket.on('conversation_started', (result) => {
  if (result.success) {
    const conversation = result.data;
    console.log('Conversation ID:', conversation.id);
    // Use this conversationId for future messages
  }
});
```

### 5.8 Mark Messages as Read

```typescript
// Mark messages as read
socket.emit('mark_as_read', {
  conversationId: '64fa123...',
  userId: 'user123' // Optional, defaults to connected user
});

socket.on('messages_marked_read', (result) => {
  if (result.success) {
    console.log('Marked as read:', result.data.modifiedCount);
  }
});
```

### 5.9 Get Unread Count

```typescript
// Get total unread messages count
socket.emit('get_unread_count', {
  userId: 'user123' // Optional
});

socket.on('unread_count', (result) => {
  if (result.success) {
    console.log('Unread messages:', result.data.unreadCount);
    // Update badge in UI
  }
});
```

### 5.10 Error Handling

```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // error: { code: 'ERROR_CODE', message: 'Error description' }
  
  switch (error.code) {
    case 'INVALID_PAYLOAD':
      // Show validation error
      break;
    case 'MISSING_USER_ID':
      // Redirect to login
      break;
    case 'FETCH_ERROR':
      // Show retry option
      break;
  }
});
```

---

## 6. CHAT SERVICE (HTTP APIS)

### Overview
HTTP endpoints để quản lý chat (nếu cần, chủ yếu dùng WebSocket).

### 6.1 Get Conversations (HTTP)

**Endpoint:** `GET /chat/conversations`  
**Authentication:** Required

```typescript
const response = await fetch('/chat/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
// Same format as WebSocket 'conversations_list' event
```

### 6.2 Get Messages (HTTP)

**Endpoint:** `GET /chat/conversations/:conversationId/messages`  
**Authentication:** Required  
**Query Params:** `limit`, `skip`

```typescript
const response = await fetch(`/chat/conversations/${conversationId}/messages?limit=50&skip=0`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
// Same format as WebSocket 'messages_history' event
```

---

## 7. ERROR HANDLING

### 7.1 Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation error or AI blocked content",
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

### 7.2 AI Service Fail-Safe

**Behavior when AI is down:**
- Content/Image moderation: **ALLOW** (không chặn user)
- Review summary: **SKIP** (giữ nguyên giá trị cũ)
- Duplicate detection: **ALLOW** (không chặn tạo sản phẩm)

**Frontend should:**
- Không hiển thị error khi AI fail-safe
- Tiếp tục hoạt động bình thường
- Log warning để debug (nếu cần)

---

## 8. AUTHENTICATION

### 8.1 Get Access Token

**Endpoint:** `POST /auth/login`

```typescript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const result = await response.json();
const { accessToken } = result;

// Store token for API calls
localStorage.setItem('accessToken', accessToken);
```

### 8.2 Use Token in Requests

**HTTP Requests:**
```typescript
const token = localStorage.getItem('accessToken');

const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**WebSocket Connection:**
```typescript
const socket = io('http://localhost:3000/chat', {
  query: { 
    userId: 'user123',
    token: token // Optional: for additional auth
  }
});
```

---

## 9. FRONTEND INTEGRATION EXAMPLES

### 9.1 React Chat Component

```tsx
import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
}

const ChatComponent: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const userId = getCurrentUserId(); // Your auth logic
    const newSocket = io('http://localhost:3000/chat', {
      query: { userId }
    });

    // Connection events
    newSocket.on('connected', (data) => {
      console.log('Connected to chat:', data.message);
    });

    // Message events
    newSocket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_sent', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_blocked', (data) => {
      alert(`Message blocked: ${data.message}`);
    });

    // Typing events
    newSocket.on('user_typing', (data) => {
      setIsTyping(data.isTyping);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit('send_message', {
      content: newMessage,
      receiverId: 'target-user-id'
    });

    setNewMessage('');
  };

  const handleTyping = (typing: boolean) => {
    if (!socket) return;
    
    socket.emit('typing', {
      receiverId: 'target-user-id',
      isTyping: typing
    });
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <strong>{msg.senderId}:</strong> {msg.content}
          </div>
        ))}
        {isTyping && <div className="typing">User is typing...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
```

### 9.2 Product Creation with AI Guards

```tsx
import React, { useState } from 'react';

const CreateProductForm: React.FC = () => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    images: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const result = await response.json();
      console.log('Product created:', result.data);
      
      // Reset form or redirect
      setProduct({ name: '', description: '', price: 0, images: [] });
      
    } catch (err: any) {
      // Handle AI moderation errors
      if (err.message.includes('vi phạm')) {
        setError('AI đã phát hiện nội dung không phù hợp. Vui lòng kiểm tra lại thông tin sản phẩm.');
      } else if (err.message.includes('trùng lặp')) {
        setError('Sản phẩm tương tự đã tồn tại. Vui lòng kiểm tra lại.');
      } else {
        setError(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product name"
        value={product.name}
        onChange={(e) => setProduct({...product, name: e.target.value})}
        required
      />
      
      <textarea
        placeholder="Product description"
        value={product.description}
        onChange={(e) => setProduct({...product, description: e.target.value})}
      />
      
      <input
        type="number"
        placeholder="Price"
        value={product.price}
        onChange={(e) => setProduct({...product, price: Number(e.target.value)})}
        required
      />

      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
};

export default CreateProductForm;
```

---

## 10. TESTING & DEBUGGING

### 10.1 Test AI Moderation

**Test Blocked Content:**
```javascript
// This should be blocked
const blockedReview = {
  productId: 'test-id',
  rating: 1,
  content: 'Shop lừa đảo, đ** mẹ nó!'
};

// This should pass
const validReview = {
  productId: 'test-id',
  rating: 5,
  content: 'Sản phẩm rất tốt, chất lượng cao!'
};
```

### 10.2 Monitor WebSocket Events

```javascript
// Enable debug mode
localStorage.debug = 'socket.io-client:socket';

// Log all socket events
socket.onAny((eventName, ...args) => {
  console.log(`Socket Event: ${eventName}`, args);
});
```

### 10.3 Check AI Service Status

```javascript
// Monitor AI responses in browser console
// Look for these patterns in Network tab:
// - POST /reviews → 400 (AI blocked)
// - POST /products → 400 (duplicate/image violation)
// - WebSocket message_blocked events
```

---

## 11. PERFORMANCE CONSIDERATIONS

### 11.1 WebSocket Connection Management

```typescript
// Singleton socket connection
class ChatService {
  private static socket: Socket | null = null;

  static getSocket(userId: string): Socket {
    if (!this.socket) {
      this.socket = io('http://localhost:3000/chat', {
        query: { userId }
      });
    }
    return this.socket;
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
```

### 11.2 Message Pagination

```typescript
// Load messages with pagination
const loadMessages = async (conversationId: string, page: number = 0) => {
  const limit = 20;
  const skip = page * limit;

  socket.emit('get_messages', {
    conversationId,
    limit,
    skip
  });
};

// Infinite scroll implementation
const handleScroll = (e: React.UIEvent) => {
  const { scrollTop } = e.currentTarget;
  if (scrollTop === 0 && hasMoreMessages) {
    loadMessages(conversationId, currentPage + 1);
  }
};
```

### 11.3 Debounce Typing Indicator

```typescript
import { debounce } from 'lodash';

const debouncedStopTyping = debounce(() => {
  socket.emit('typing', { receiverId, isTyping: false });
}, 1000);

const handleInputChange = (value: string) => {
  setMessage(value);
  
  // Start typing
  socket.emit('typing', { receiverId, isTyping: true });
  
  // Stop typing after 1s of inactivity
  debouncedStopTyping();
};
```

---

## 12. TROUBLESHOOTING

### 12.1 Common Issues

**WebSocket Connection Failed:**
```javascript
// Check if server is running
// Verify namespace is correct (/chat)
// Check CORS settings
// Ensure userId is provided in query
```

**AI Moderation Not Working:**
```javascript
// Check GEMINI_API_KEY in server .env
// Verify API quota not exceeded
// Check server logs for AI errors
// Test with simple content first
```

**Messages Not Persisting:**
```javascript
// Verify chat-service is running
// Check Kafka connection
// Ensure MongoDB is accessible
// Check server logs for errors
```

### 12.2 Debug Commands

```bash
# Check services status
docker-compose ps

# View API Gateway logs
docker-compose logs -f api-gateway

# View Chat Service logs
docker-compose logs -f chat-service

# Test WebSocket connection
curl -X GET http://localhost:3000/health
```

---

## 13. PRODUCT SEARCH BY IMAGE

### Overview

API cho phép người dùng tìm kiếm sản phẩm bằng cách upload ảnh. Hệ thống sử dụng AI (Gemini Vision) để phân tích ảnh, trích xuất mô tả sản phẩm, sau đó tìm kiếm sản phẩm.

**Flow:** Image → AI Vision → Text Query → Product Search

---

### 13.1 Search Products by Image

**Endpoint:** `POST /products/search-by-image`

**Base URL:** `http://localhost:3000` (API Gateway)

**Content-Type:** `application/json`

```json
{
  "image": "<URL_hoặc_Base64_String>",
  "limit": 20
}
```

#### Parameters

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `image` | string | Yes | URL ảnh hoặc Base64 string (có thể có prefix `data:image/...;base64,`) |
| `limit` | number | No | Số lượng sản phẩm tối đa (default: 20) |

#### Supported Image Formats

**1) URL ảnh**

```json
{
  "image": "https://example.com/product.jpg",
  "limit": 10
}
```

**2) Base64 có prefix**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "limit": 10
}
```

**3) Base64 không prefix**

```json
{
  "image": "/9j/4AAQSkZJRg...",
  "limit": 10
}
```

---

### 13.2 Response

#### Success Response (200)

```json
{
  "success": true,
  "queryUsed": "điện thoại iPhone 13 màu đỏ smartphone cao cấp Apple",
  "keywords": ["iphone", "điện thoại", "đỏ", "smartphone", "apple"],
  "products": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "iPhone 13 128GB - Đỏ",
      "price": 18990000,
      "images": ["https://..."],
      "description": "...",
      "stock": 50,
      "ratingAvg": 4.5,
      "reviewSummary": "..."
    }
  ],
  "total": 1
}
```

#### AI cannot extract query (200)

```json
{
  "success": false,
  "message": "Không thể phân tích ảnh. Vui lòng thử lại hoặc sử dụng tìm kiếm text.",
  "queryUsed": null,
  "keywords": [],
  "products": []
}
```

#### Image policy violation (200)

```json
{
  "success": false,
  "message": "Ảnh vi phạm chính sách nội dung. Vui lòng thử ảnh khác.",
  "queryUsed": null,
  "keywords": [],
  "products": []
}
```

#### Missing field (400)

```json
{
  "statusCode": 400,
  "message": "Thiếu trường \"image\"",
  "error": "Bad Request"
}
```

---

### 13.3 Caching & Performance

- API có cache trong **1 giờ** cho cùng 1 ảnh.
- Lần search đầu: thường 2-3 giây (gọi AI).
- Lần search tiếp theo (cùng ảnh): nhanh hơn do dùng cache.

---

### 13.4 Frontend Integration Example

```javascript
const handleImageUpload = async (file) => {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const response = await fetch('http://localhost:3000/products/search-by-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: reader.result,
        limit: 20,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Query used:', result.queryUsed);
      console.log('Products found:', result.products);
    } else {
      console.error('Error:', result.message);
    }
  };

  reader.readAsDataURL(file);
};
```

---

**END OF DOCUMENTATION**

For additional support or questions, please contact the backend development team.