/**
 * ChatContext - Context để quản lý chat state và actions từ bất kỳ đâu trong app
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatContextType {
  openChat: (targetUserId: string) => void;
  isChatOpen: boolean;
  currentTargetUserId: string | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: React.ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentTargetUserId, setCurrentTargetUserId] = useState<string | null>(null);

  const openChat = useCallback((targetUserId: string) => {
    setCurrentTargetUserId(targetUserId);
    setIsChatOpen(true);
    // Trigger chat floating button to open
    const event = new CustomEvent('openChat', { detail: { targetUserId } });
    window.dispatchEvent(event);
  }, []);

  return (
    <ChatContext.Provider value={{ openChat, isChatOpen, currentTargetUserId }}>
      {children}
    </ChatContext.Provider>
  );
}

