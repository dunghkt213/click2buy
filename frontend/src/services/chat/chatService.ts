/**
 * Chat Service - WebSocket service for real-time chat
 */

import { io, Socket } from 'socket.io-client';
import { authStorage } from '../../apis/auth';
import { API_BASE_URL } from '../../apis/client/baseUrl';
import { ChatError, ChatMessage, Conversation, TypingStatus } from '../../types/interface/chat.types';

class ChatService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // Event handlers
  private onMessageHandlers: ((message: ChatMessage) => void)[] = [];
  private onConversationHandlers: ((conversations: Conversation[]) => void)[] = [];
  private onTypingHandlers: ((data: TypingStatus) => void)[] = [];
  private onErrorHandlers: ((error: ChatError) => void)[] = [];
  private onBlockedHandlers: ((data: { message: string; timestamp: string }) => void)[] = [];
  private onUnreadCountHandlers: ((count: number) => void)[] = [];
  private onMessagesHistoryHandlers: ((messages: ChatMessage[]) => void)[] = [];

  /**
   * Connect to chat service
   */
  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected && this.userId === userId) {
        resolve();
        return;
      }

      // Disconnect existing connection if userId changed
      if (this.socket && this.userId !== userId) {
        this.disconnect();
      }

      this.userId = userId;

      // Get authentication token (optional, backend may use cookies)
      const token = authStorage.getToken();

      // Connect to chat namespace according to API documentation
      // URL: ws://localhost:3000/chat
      // Query: { userId: 'user123' }
      this.socket = io(`${API_BASE_URL}/chat`, {
        query: {
          userId, // Required by API
        },
        // Optional: include token in auth if backend requires it
        ...(token && { auth: { token } }),
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        withCredentials: true, // Include cookies for authentication
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('✅ Chat WebSocket connected:', {
          socketId: this.socket?.id,
          userId: this.userId,
          namespace: '/chat',
        });
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connected', (data: { message: string; socketId: string; timestamp: string }) => {
        console.log('✅ Server confirmed connection:', data);
      });

      this.socket.on('disconnect', () => {
        console.log('Chat disconnected');
        this.isConnected = false;
      });

      // Handle connection errors separately (will be handled in error section below)
      let connectionErrorHandled = false;
      this.socket.on('connect_error', (error) => {
        console.error('Chat connection error:', error);
        this.reconnectAttempts++;
        if (!connectionErrorHandled && this.reconnectAttempts >= this.maxReconnectAttempts) {
          connectionErrorHandled = true;
          reject(error);
        }
      });

      // Message events
      this.socket.on('receive_message', (message: ChatMessage) => {
        console.log('Received message:', message);
        this.onMessageHandlers.forEach(handler => handler(message));
      });

      this.socket.on('message_sent', (message: ChatMessage) => {
        console.log('✅ Message sent successfully:', message);
        this.onMessageHandlers.forEach(handler => handler(message));
      });

      this.socket.on('message_blocked', (data: { code: string; message: string; timestamp: string }) => {
        console.warn('Message blocked:', data.message);
        this.onBlockedHandlers.forEach(handler => handler(data));
      });

      // Conversation events
      this.socket.on('conversations_list', (result: { success: boolean; data: Conversation[] }) => {
        if (result.success) {
          console.log('Conversations:', result.data);
          this.onConversationHandlers.forEach(handler => handler(result.data));
        }
      });

      this.socket.on('conversation_started', (result: { success: boolean; data: Conversation }) => {
        if (result.success) {
          console.log('Conversation started:', result.data);
        }
      });

      this.socket.on('joined_conversation', (data: { conversationId: string }) => {
        console.log('Joined conversation:', data.conversationId);
      });

      // Messages history - emit to handlers
      this.socket.on('messages_history', (result: { success: boolean; data: ChatMessage[]; pagination?: any }) => {
        if (result.success && result.data) {
          console.log('Messages history:', result.data);
          // Emit to all handlers
          this.onMessagesHistoryHandlers.forEach(handler => handler(result.data));
        } else {
          console.warn('Messages history failed or empty:', result);
        }
      });

      // Typing events
      this.socket.on('user_typing', (data: TypingStatus) => {
        this.onTypingHandlers.forEach(handler => handler(data));
      });

      // Unread count
      this.socket.on('unread_count', (result: { success: boolean; data: { unreadCount: number } }) => {
        if (result.success) {
          console.log('Unread count:', result.data.unreadCount);
          this.onUnreadCountHandlers.forEach(handler => handler(result.data.unreadCount));
        }
      });

      // Error handling
      this.socket.on('error', (error: ChatError | any) => {
        console.error('❌ Socket error event:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', error ? Object.keys(error) : 'null');
        console.error('Full error object:', JSON.stringify(error, null, 2));

        // Handle different error formats
        const chatError: ChatError = {
          code: error?.code || error?.type || error?.error?.code || 'UNKNOWN_ERROR',
          message: error?.message || error?.error?.message || error?.data?.message || String(error) || 'Unknown socket error',
          timestamp: new Date().toISOString(),
        };
        console.error('Formatted chat error:', chatError);
        this.onErrorHandlers.forEach(handler => handler(chatError));
      });

      // Handle connection errors (separate from 'error' event)
      this.socket.on('connect_error', (error: any) => {
        console.error('Socket connect_error event:', error);
        console.error('Connection error type:', typeof error);
        console.error('Connection error details:', {
          message: error?.message,
          description: error?.description,
          context: error?.context,
          type: error?.type,
          data: error?.data,
        });
        const chatError: ChatError = {
          code: error?.type || error?.code || 'CONNECTION_ERROR',
          message: error?.message || error?.description || 'Không thể kết nối đến chat service',
          timestamp: new Date().toISOString(),
        };
        this.onErrorHandlers.forEach(handler => handler(chatError));
      });
    });
  }

  /**
   * Disconnect from chat service
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  /**
   * Send a message
   * According to API: socket.emit('send_message', { content, receiverId, conversationId })
   * NOTE: conversationId is REQUIRED by backend
   */
  sendMessage(content: string, receiverId: string, conversationId: string): void {
    if (!this.socket) {
      console.error('❌ Socket not initialized');
      return;
    }

    if (!this.isConnected || !this.socket.connected) {
      console.error('❌ Socket not connected. Connection status:', {
        isConnected: this.isConnected,
        socketConnected: this.socket.connected,
        socketId: this.socket.id,
      });
      return;
    }

    if (!content || !content.trim()) {
      console.error('❌ Message content is empty');
      return;
    }

    if (!receiverId) {
      console.error('❌ Receiver ID is required');
      return;
    }

    if (!conversationId) {
      console.error('❌ Conversation ID is REQUIRED');
      return;
    }

    console.log('📤 Sending message:', {
      content: content.trim(),
      receiverId,
      conversationId,
      socketId: this.socket.id,
      isConnected: this.isConnected,
      socketConnected: this.socket.connected,
    });

    // Emit send_message event according to API documentation
    // Format: { content, receiverId, conversationId } - conversationId is REQUIRED
    // Final validation before creating payload
    if (!conversationId || conversationId.trim() === '') {
      console.error('❌ CRITICAL: conversationId is invalid in sendMessage:', {
        conversationId,
        type: typeof conversationId,
        length: conversationId?.length,
      });
      return;
    }

    const messagePayload = {
      content: content.trim(),
      receiverId,
      conversationId: conversationId.trim(), // Ensure it's a string and trimmed
    };

    console.log('📤 Message payload (final):', {
      ...messagePayload,
      conversationIdLength: messagePayload.conversationId.length,
      conversationIdType: typeof messagePayload.conversationId,
    });

    try {
      this.socket.emit('send_message', messagePayload);
      console.log('✅ Message emit successful');
    } catch (error) {
      console.error('❌ Error emitting message:', error);
      throw error;
    }
  }

  /**
   * Get conversations list
   */
  getConversations(userId?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_conversations', { userId });
  }

  /**
   * Get messages history
   */
  getMessages(conversationId: string, limit: number = 50, skip: number = 0): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_messages', {
      conversationId,
      limit,
      skip,
    });
  }

  /**
   * Start a new conversation
   */
  startConversation(targetUserId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('start_conversation', {
      targetUserId,
    });
  }

  /**
   * Join a conversation
   */
  joinConversation(conversationId: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join_conversation', {
      conversationId,
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, userId?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('mark_as_read', {
      conversationId,
      userId,
    });
  }

  /**
   * Get unread count
   */
  getUnreadCount(userId?: string): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('get_unread_count', { userId });
  }

  /**
   * Send typing status
   */
  sendTyping(receiverId: string, isTyping: boolean): void {
    if (!this.socket || !this.isConnected) {
      return;
    }

    this.socket.emit('typing', {
      receiverId,
      isTyping,
    });
  }

  /**
   * Event handlers registration
   */
  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.onMessageHandlers.push(handler);
    return () => {
      this.onMessageHandlers = this.onMessageHandlers.filter(h => h !== handler);
    };
  }

  onConversations(handler: (conversations: Conversation[]) => void): () => void {
    this.onConversationHandlers.push(handler);
    return () => {
      this.onConversationHandlers = this.onConversationHandlers.filter(h => h !== handler);
    };
  }

  onTyping(handler: (data: TypingStatus) => void): () => void {
    this.onTypingHandlers.push(handler);
    return () => {
      this.onTypingHandlers = this.onTypingHandlers.filter(h => h !== handler);
    };
  }

  onError(handler: (error: ChatError) => void): () => void {
    this.onErrorHandlers.push(handler);
    return () => {
      this.onErrorHandlers = this.onErrorHandlers.filter(h => h !== handler);
    };
  }

  onBlocked(handler: (data: { message: string; timestamp: string }) => void): () => void {
    this.onBlockedHandlers.push(handler);
    return () => {
      this.onBlockedHandlers = this.onBlockedHandlers.filter(h => h !== handler);
    };
  }

  onUnreadCount(handler: (count: number) => void): () => void {
    this.onUnreadCountHandlers.push(handler);
    return () => {
      this.onUnreadCountHandlers = this.onUnreadCountHandlers.filter(h => h !== handler);
    };
  }

  onMessagesHistory(handler: (messages: ChatMessage[]) => void): () => void {
    this.onMessagesHistoryHandlers.push(handler);
    return () => {
      this.onMessagesHistoryHandlers = this.onMessagesHistoryHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }
}

// Singleton instance
export const chatService = new ChatService();

