import React, { useState } from 'react';
import { MessageCircle, X, Minimize2, Send, Paperclip, Image as ImageIcon, Smile, Search, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { useAppContext } from '../../providers/AppProvider'; // [ĐÃ SỬA] Import useAppContext

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  imageUrl?: string;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerStatus: 'online' | 'offline';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

// Bỏ interface ChatFloatingButtonProps

export function ChatFloatingButton() {
  const app = useAppContext(); // [MỚI] Lấy toàn bộ Context
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv-1');

  // --- Dữ liệu giả định (MOCK DATA) ---
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      sellerId: 'seller-1',
      sellerName: 'Tech Store VN',
      sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS',
      sellerStatus: 'online',
      lastMessage: 'Dạ vẫn còn hàng ạ. Hiện tại shop có 2 màu...',
      lastMessageTime: new Date(Date.now() - 2400000).toISOString(),
      unreadCount: 2,
      messages: [
        { id: '1', senderId: 'seller-1', senderName: 'Tech Store VN', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS', content: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'text', isRead: true },
        { id: '2', senderId: 'user-1', senderName: 'Bạn', content: 'Cho tôi hỏi sản phẩm iPhone 15 Pro còn hàng không?', timestamp: new Date(Date.now() - 3000000).toISOString(), type: 'text', isRead: true },
        { id: '3', senderId: 'seller-1', senderName: 'Tech Store VN', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS', content: 'Dạ vẫn còn hàng ạ. Hiện tại shop có 2 màu: Titan Tự Nhiên và Titan Xanh. Bạn quan tâm màu nào?', timestamp: new Date(Date.now() - 2400000).toISOString(), type: 'text', isRead: false }
      ]
    },
    {
      id: 'conv-2',
      sellerId: 'seller-2',
      sellerName: 'Fashion House',
      sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FH',
      sellerStatus: 'online',
      lastMessage: 'Shop có nhiều mẫu mới về nè bạn!',
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      unreadCount: 0,
      messages: [
        { id: '1', senderId: 'seller-2', senderName: 'Fashion House', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FH', content: 'Chào bạn! Cảm ơn đã quan tâm đến shop nhé!', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'text', isRead: true },
        { id: '2', senderId: 'user-1', senderName: 'Bạn', content: 'Shop có áo khoác nữ không ạ?', timestamp: new Date(Date.now() - 10800000).toISOString(), type: 'text', isRead: true },
        { id: '3', senderId: 'seller-2', senderName: 'Fashion House', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FH', content: 'Shop có nhiều mẫu mới về nè bạn!', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'text', isRead: true }
      ]
    },
    {
      id: 'conv-3',
      sellerId: 'seller-3',
      sellerName: 'Beauty Shop',
      sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS',
      sellerStatus: 'offline',
      lastMessage: 'Cảm ơn bạn đã mua hàng!',
      lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 0,
      messages: [
        { id: '1', senderId: 'user-1', senderName: 'Bạn', content: 'Sản phẩm này có màu khác không shop?', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'text', isRead: true },
        { id: '2', senderId: 'seller-3', senderName: 'Beauty Shop', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS', content: 'Dạ có nhiều màu lắm ạ. Bạn cần tư vấn thêm không?', timestamp: new Date(Date.now() - 169200000).toISOString(), type: 'text', isRead: true },
        { id: '3', senderId: 'seller-3', senderName: 'Beauty Shop', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS', content: 'Cảm ơn bạn đã mua hàng!', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'text', isRead: true }
      ]
    },
    {
      id: 'conv-4',
      sellerId: 'seller-4',
      sellerName: 'Home & Living',
      sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HL',
      sellerStatus: 'online',
      lastMessage: 'Bạn muốn đặt hàng không ạ?',
      lastMessageTime: new Date(Date.now() - 18000000).toISOString(),
      unreadCount: 1,
      messages: [
        { id: '1', senderId: 'user-1', senderName: 'Bạn', content: 'Cho mình xem thêm mẫu bàn ghế nhé', timestamp: new Date(Date.now() - 36000000).toISOString(), type: 'text', isRead: true },
        { id: '2', senderId: 'seller-4', senderName: 'Home & Living', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HL', content: 'Bạn muốn đặt hàng không ạ?', timestamp: new Date(Date.now() - 18000000).toISOString(), type: 'text', isRead: false }
      ]
    },
    {
      id: 'conv-5',
      sellerId: 'seller-5',
      sellerName: 'Sports Gear',
      sellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SG',
      sellerStatus: 'offline',
      lastMessage: 'Bạn ơi, shop sẽ phản hồi lại trong giờ làm việc nhé',
      lastMessageTime: new Date(Date.now() - 432000000).toISOString(),
      unreadCount: 0,
      messages: [
        { id: '1', senderId: 'user-1', senderName: 'Bạn', content: 'Giày chạy bộ size 42 còn không shop?', timestamp: new Date(Date.now() - 518400000).toISOString(), type: 'text', isRead: true },
        { id: '2', senderId: 'seller-5', senderName: 'Sports Gear', senderAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SG', content: 'Bạn ơi, shop sẽ phản hồi lại trong giờ làm việc nhé', timestamp: new Date(Date.now() - 432000000).toISOString(), type: 'text', isRead: true }
      ]
    }
  ]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const filteredConversations = conversations.filter(conv =>
    conv.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'user-1',
      senderName: 'Bạn',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: true
    };

    // Update conversation with new message
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: message,
          lastMessageTime: new Date().toISOString()
        };
      }
      return conv;
    }));

    setMessage('');

    // Simulate seller response
    setTimeout(() => {
      const responses = [
        'Cảm ơn bạn đã liên hệ! Tôi sẽ kiểm tra thông tin và phản hồi ngay.',
        'Để tôi kiểm tra kho hàng và báo lại cho bạn nhé!',
        'Bạn có thể để lại số điện thoại để shop tư vấn chi tiết hơn không?',
        'Shop có chương trình khuyến mãi đặc biệt cho sản phẩm này. Bạn có muốn tìm hiểu thêm không?'
      ];
      
      const sellerResponse: Message = {
        id: `msg-${Date.now()}-seller`,
        senderId: selectedConversation.sellerId,
        senderName: selectedConversation.sellerName,
        senderAvatar: selectedConversation.sellerAvatar,
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'text',
        isRead: false
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, sellerResponse],
            lastMessage: sellerResponse.content,
            lastMessageTime: new Date().toISOString(),
            unreadCount: conv.unreadCount + 1
          };
        }
        return conv;
      }));
    }, 1500);
  };

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    // Mark messages as read
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, isRead: true }))
        };
      }
      return conv;
    }));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit'
    });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- QUYẾT ĐỊNH HIỂN THỊ DỰA TRÊN Context ---
  if (!app.isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        >
          <MessageCircle className="h-6 w-6" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex bg-white rounded-lg shadow-2xl border border-border transition-all ${
            isMinimized ? 'h-[60px] w-[380px]' : 'h-[700px] w-[900px]'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between border-b border-border p-4 ${isMinimized ? 'w-full' : 'w-full absolute top-0 left-0 right-0 z-10 bg-white rounded-t-lg'}`}>
            <h3>Tin nhắn</h3>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          {!isMinimized && (
            <div className="flex w-full pt-[73px]">
              {/* Conversations List - Left Sidebar */}
              <div className="w-[320px] border-r border-border flex flex-col">
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm shop..."
                      className="w-full rounded-md bg-accent pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`w-full flex items-start gap-3 p-3 hover:bg-accent transition-colors ${
                        selectedConversationId === conv.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img 
                          src={conv.sellerAvatar} 
                          alt={conv.sellerName}
                          className="h-12 w-12 rounded-full"
                        />
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          conv.sellerStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                      
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="truncate">{conv.sellerName}</h4>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? '' : 'text-muted-foreground'}`}>
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Content - Right Side */}
              {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={selectedConversation.sellerAvatar} 
                          alt={selectedConversation.sellerName}
                          className="h-10 w-10 rounded-full"
                        />
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          selectedConversation.sellerStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                      </div>
                      
                      <div>
                        <h4>{selectedConversation.sellerName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.sellerStatus === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-accent rounded-md transition-colors" title="Gọi thoại">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-md transition-colors" title="Gọi video">
                        <Video className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-md transition-colors" title="Thông tin">
                        <Info className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-md transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {selectedConversation.messages.map((msg) => {
                      const isUser = msg.senderId === 'user-1';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {!isUser && (
                            <img
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-full flex-shrink-0"
                            />
                          )}
                          
                          <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                            {msg.type === 'text' ? (
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isUser
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-white text-foreground rounded-bl-sm border border-border'
                                }`}
                              >
                                {/* Thêm break-words để xử lý text dài không khoảng trắng */}
                                <p className="break-words">{msg.content}</p> 
                              </div>
                            ) : (
                              <div className="rounded-lg overflow-hidden">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Shared image"
                                  className="max-w-full h-auto"
                                />
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground px-2">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-border p-4 bg-white">
                    <div className="flex items-end gap-2">
                      <div className="flex gap-1 pb-2">
                        <button
                          className="p-2 hover:bg-accent rounded-md transition-colors flex-shrink-0"
                          title="Đính kèm file"
                        >
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </button>
                        
                        <button
                          className="p-2 hover:bg-accent rounded-md transition-colors flex-shrink-0"
                          title="Gửi hình ảnh"
                        >
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Nhập tin nhắn..."
                          rows={1}
                          className="w-full rounded-lg bg-accent px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-primary/20 resize-none break-all"
                          style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                        <button
                          className="absolute right-2 bottom-2 p-1 hover:bg-background rounded-full transition-colors"
                        >
                          <Smile className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </div>

                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 mb-1"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}