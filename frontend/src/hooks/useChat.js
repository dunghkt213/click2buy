/**
 * useChat - Custom hook for managing chat state and WebSocket connection
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { chatService } from '../services/chat/chatService';
import { toast } from 'sonner';
export function useChat({ userId, autoConnect = true }) {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const typingTimeoutRef = useRef({});
    // Connect to chat service
    useEffect(() => {
        if (!userId || !autoConnect)
            return;
        setLoading(true);
        chatService
            .connect(userId)
            .then(() => {
            setIsConnected(true);
            setLoading(false);
            // Load conversations and unread count
            chatService.getConversations(userId);
            chatService.getUnreadCount(userId);
        })
            .catch((error) => {
            console.error('Failed to connect to chat:', error);
            toast.error('Không thể kết nối đến dịch vụ chat');
            setLoading(false);
        });
        return () => {
            chatService.disconnect();
            setIsConnected(false);
        };
    }, [userId, autoConnect]);
    // Register event handlers
    useEffect(() => {
        if (!isConnected)
            return;
        const unsubscribeMessage = chatService.onMessage((message) => {
            console.log('📨 Received message in useChat:', message);
            setMessages((prev) => {
                // Avoid duplicates by ID
                if (prev.some((m) => m.id === message.id)) {
                    console.log('Message already exists, skipping:', message.id);
                    return prev;
                }
                const newMessages = [...prev, message].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                console.log('Added message, total messages:', newMessages.length);
                return newMessages;
            });
            // Update conversation
            if (message.conversationId) {
                setConversations((prev) => prev.map((conv) => {
                    const convId = conv.id || conv._id;
                    if (convId === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: message,
                            lastMessageTime: message.timestamp,
                            unreadCount: convId === currentConversationId ? 0 : (conv.unreadCount || 0) + 1,
                        };
                    }
                    return conv;
                }));
            }
        });
        const unsubscribeConversations = chatService.onConversations((convs) => {
            setConversations(convs);
        });
        // Handle conversation_started event
        const socket = chatService.socket;
        let conversationStartedCleanup;
        if (socket) {
            const handleConversationStarted = (result) => {
                console.log('✅ Conversation started event received:', result);
                if (result.success && result.data) {
                    // Normalize conversation ID (use _id if id is not available)
                    const conversationId = result.data.id || result.data._id;
                    if (!conversationId || conversationId.trim() === '') {
                        console.error('❌ Conversation started but has no valid ID:', result.data);
                        return;
                    }
                    console.log('✅ Normalized conversation ID:', conversationId);
                    // Normalize conversation object
                    const normalizedConv = {
                        ...result.data,
                        id: conversationId,
                    };
                    setConversations((prev) => {
                        // Check if conversation already exists
                        const exists = prev.some(c => {
                            const cId = c.id || c._id;
                            return cId === conversationId;
                        });
                        if (exists) {
                            console.log('Conversation already exists, updating...');
                            return prev.map(c => {
                                const cId = c.id || c._id;
                                return cId === conversationId ? normalizedConv : c;
                            });
                        }
                        console.log('Adding new conversation to list');
                        return [...prev, normalizedConv];
                    });
                    // Set current conversation ID so user can send messages
                    console.log('✅ Setting currentConversationId to:', conversationId);
                    setCurrentConversationId(conversationId);
                }
                else {
                    console.error('❌ Conversation started but result is not successful:', result);
                }
            };
            socket.on('conversation_started', handleConversationStarted);
            conversationStartedCleanup = () => {
                socket.off('conversation_started', handleConversationStarted);
            };
        }
        const unsubscribeTyping = chatService.onTyping((data) => {
            setIsTyping((prev) => ({
                ...prev,
                [data.senderId]: data.isTyping,
            }));
            // Auto-clear typing after 3 seconds
            if (data.isTyping) {
                if (typingTimeoutRef.current[data.senderId]) {
                    clearTimeout(typingTimeoutRef.current[data.senderId]);
                }
                typingTimeoutRef.current[data.senderId] = setTimeout(() => {
                    setIsTyping((prev) => ({
                        ...prev,
                        [data.senderId]: false,
                    }));
                }, 3000);
            }
        });
        const unsubscribeError = chatService.onError((error) => {
            console.error('Chat error:', error);
            switch (error.code) {
                case 'INVALID_PAYLOAD':
                    toast.error('Tin nhắn không hợp lệ');
                    break;
                case 'MISSING_USER_ID':
                    toast.error('Vui lòng đăng nhập để sử dụng chat');
                    break;
                case 'FETCH_ERROR':
                    toast.error('Lỗi kết nối. Vui lòng thử lại');
                    break;
                default:
                    toast.error(error.message || 'Có lỗi xảy ra');
            }
        });
        const unsubscribeBlocked = chatService.onBlocked((data) => {
            toast.error(`Tin nhắn bị chặn: ${data.message}`);
        });
        const unsubscribeUnreadCount = chatService.onUnreadCount((count) => {
            setUnreadCount(count);
        });
        // Handle messages history
        const unsubscribeMessagesHistory = chatService.onMessagesHistory((messages) => {
            console.log('📜 Received messages history:', messages.length, 'messages', messages);
            setMessages((prev) => {
                // Normalize messages (backend may return _id instead of id)
                const normalizedMessages = messages.map(msg => ({
                    ...msg,
                    id: msg.id || msg._id || '', // Normalize id field
                })).filter(msg => msg.id); // Filter out messages without id
                // Merge with existing messages, avoiding duplicates
                const existingIds = new Set(prev.map(m => m.id));
                const newMessages = normalizedMessages.filter(m => !existingIds.has(m.id));
                const merged = [...prev, ...newMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                console.log('📜 Merged messages history:', {
                    received: messages.length,
                    normalized: normalizedMessages.length,
                    new: newMessages.length,
                    total: merged.length,
                });
                return merged;
            });
        });
        return () => {
            unsubscribeMessage();
            unsubscribeConversations();
            unsubscribeTyping();
            unsubscribeError();
            unsubscribeBlocked();
            unsubscribeUnreadCount();
            unsubscribeMessagesHistory();
            conversationStartedCleanup?.();
        };
    }, [isConnected, currentConversationId, setCurrentConversationId]);
    // Load messages when conversation changes
    useEffect(() => {
        if (!currentConversationId || !isConnected)
            return;
        try {
            console.log('Loading conversation:', currentConversationId);
            chatService.joinConversation(currentConversationId);
            chatService.getMessages(currentConversationId);
            // Mark as read separately to avoid blocking
            setTimeout(() => {
                chatService.markAsRead(currentConversationId, userId || undefined);
            }, 100);
        }
        catch (error) {
            console.error('Error loading conversation:', error);
        }
    }, [currentConversationId, isConnected, userId]);
    // Send message - conversationId is REQUIRED
    const sendMessage = useCallback((content, receiverId, conversationId) => {
        // Validate all inputs
        if (!isConnected) {
            console.error('❌ Cannot send message: not connected');
            toast.error('Chưa kết nối đến dịch vụ chat');
            return;
        }
        if (!content || !content.trim()) {
            console.error('❌ Cannot send message: content is empty');
            return;
        }
        if (!receiverId || receiverId.trim() === '') {
            console.error('❌ Cannot send message: receiverId is invalid:', receiverId);
            toast.error('Không tìm thấy người nhận');
            return;
        }
        if (!conversationId || conversationId.trim() === '') {
            console.error('❌ Cannot send message: conversationId is invalid:', conversationId);
            toast.error('Vui lòng chọn cuộc trò chuyện trước khi gửi tin nhắn');
            return;
        }
        console.log('📤 useChat sendMessage:', {
            content: content.trim(),
            receiverId,
            conversationId,
            isValid: !!(content.trim() && receiverId && conversationId),
        });
        try {
            chatService.sendMessage(content.trim(), receiverId, conversationId);
        }
        catch (error) {
            console.error('❌ Error in sendMessage:', error);
            toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    }, [isConnected]);
    // Start conversation
    const startConversation = useCallback((targetUserId) => {
        if (!isConnected) {
            toast.error('Chưa kết nối đến dịch vụ chat');
            return;
        }
        chatService.startConversation(targetUserId);
    }, [isConnected]);
    // Send typing status
    const sendTyping = useCallback((receiverId, typing) => {
        if (!isConnected)
            return;
        chatService.sendTyping(receiverId, typing);
    }, [isConnected]);
    // Load conversations
    const loadConversations = useCallback(() => {
        if (!isConnected || !userId)
            return;
        chatService.getConversations(userId);
    }, [isConnected, userId]);
    // Load messages
    const loadMessages = useCallback((conversationId, limit = 50, skip = 0) => {
        if (!isConnected)
            return;
        chatService.getMessages(conversationId, limit, skip);
    }, [isConnected]);
    // Mark as read
    const markAsRead = useCallback((conversationId) => {
        if (!isConnected)
            return;
        chatService.markAsRead(conversationId, userId || undefined);
    }, [isConnected, userId]);
    // Get unread count
    const loadUnreadCount = useCallback(() => {
        if (!isConnected || !userId)
            return;
        chatService.getUnreadCount(userId);
    }, [isConnected, userId]);
    return {
        // State
        messages,
        conversations,
        currentConversationId,
        isConnected,
        isTyping,
        unreadCount,
        loading,
        // Actions
        sendMessage,
        startConversation,
        sendTyping,
        setCurrentConversationId,
        loadConversations,
        loadMessages,
        markAsRead,
        loadUnreadCount,
        setMessages,
    };
}
