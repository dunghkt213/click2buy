/**
 * Chat Types - Type definitions for Chat Service
 */

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  conversationId?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file';
}

export interface Conversation {
  id?: string; // Frontend uses 'id'
  _id?: string; // Backend may return '_id'
  participants: string[];
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  lastMessageAt?: string; // Backend may use 'lastMessageAt'
  unreadCount?: number | { [userId: string]: number }; // Backend may return object
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline';
}

export interface TypingStatus {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

export interface ChatError {
  code: string;
  message: string;
  timestamp?: string;
}

