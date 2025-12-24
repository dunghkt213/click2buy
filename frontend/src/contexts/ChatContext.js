import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ChatContext - Context để quản lý chat state và actions từ bất kỳ đâu trong app
 */
import { createContext, useContext, useState, useCallback } from 'react';
const ChatContext = createContext(null);
export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
}
export function ChatProvider({ children }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentTargetUserId, setCurrentTargetUserId] = useState(null);
    const openChat = useCallback((targetUserId) => {
        setCurrentTargetUserId(targetUserId);
        setIsChatOpen(true);
        // Trigger chat floating button to open
        const event = new CustomEvent('openChat', { detail: { targetUserId } });
        window.dispatchEvent(event);
    }, []);
    return (_jsx(ChatContext.Provider, { value: { openChat, isChatOpen, currentTargetUserId }, children: children }));
}
