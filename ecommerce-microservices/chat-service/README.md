# Chat Service

Microservice quản lý chat messages và conversations cho hệ thống Click2Buy.

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│    Frontend     │◄──────────────────►│   API Gateway   │
│   (Socket.IO)   │                    │  (ChatGateway)  │
└─────────────────┘                    └────────┬────────┘
                                                │
                                         Kafka Events
                                                │
                                       ┌────────▼────────┐
                                       │  Chat Service   │
                                       │  (Persistence)  │
                                       └────────┬────────┘
                                                │
                                       ┌────────▼────────┐
                                       │    MongoDB      │
                                       │   (chat_db)     │
                                       └─────────────────┘
```

## Kafka Events

### EventPattern (Fire & Forget)
| Event | Description |
|-------|-------------|
| `chat.message.send` | Lưu tin nhắn mới vào database |

### MessagePattern (Request/Reply)
| Pattern | Description |
|---------|-------------|
| `chat.conversation.findOrCreate` | Tìm hoặc tạo conversation |
| `chat.message.findByConversation` | Lấy messages theo conversation |
| `chat.conversation.findByUser` | Lấy conversations của user |
| `chat.message.markAsRead` | Đánh dấu đã đọc |
| `chat.message.unreadCount` | Lấy số tin chưa đọc |

## Database Schema

### Conversation
```typescript
{
  _id: ObjectId,
  participants: string[],      // [userId1, userId2]
  lastMessage: string,         // Preview tin nhắn cuối
  lastMessageAt: Date,
  unreadCount: {               // Số tin chưa đọc theo user
    [userId]: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: string,
  receiverId: string,
  content: string,
  isRead: boolean,
  readAt: Date,
  status: 'sent' | 'delivered' | 'read',
  createdAt: Date,
  updatedAt: Date
}
```

## Test Flow

### Online User
1. User A connect WebSocket với `userId`
2. User A gửi `send_message` → AI moderation → Kafka → chat-service lưu DB
3. User B (online) nhận `receive_message` qua WebSocket

### Offline User
1. User A gửi tin nhắn cho User B (offline)
2. Tin nhắn được lưu vào DB qua chat-service
3. User B online → gọi `get_conversations` + `get_messages` để fetch lịch sử

## TODO: Future Enhancements

- [ ] Read receipt notification (emit event khi user đọc tin)
- [ ] Typing indicator persistence
- [ ] Message status tracking (sent → delivered → read)
- [ ] File/Image attachments
- [ ] Group chat support
- [ ] Message search
- [ ] Message reactions
