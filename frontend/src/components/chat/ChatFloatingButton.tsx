import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAppContext } from '../../providers/AppProvider';
import { useChat } from '../../hooks/useChat';

export function ChatFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useAppContext();
  const userId = app.user?.id || null;
  
  const {
    conversations,
    unreadCount,
  } = useChat({ userId, autoConnect: app.isLoggedIn });

  // Calculate total unread count
  const totalUnreadCount = unreadCount || conversations.reduce((sum, conv) => {
    if (typeof conv.unreadCount === 'number') {
      return sum + conv.unreadCount;
    } else if (typeof conv.unreadCount === 'object' && conv.unreadCount && userId) {
      return sum + (conv.unreadCount[userId] || 0);
    }
    return sum;
  }, 0);

  // Handle openChat event from other pages - navigate to chat page
  React.useEffect(() => {
    const handleOpenChat = (event: CustomEvent<{ targetUserId: string }>) => {
      const { targetUserId } = event.detail;
      if (!targetUserId) return;
      
      // Navigate to chat page with targetUserId as query param
      navigate(`/chat?userId=${targetUserId}`);
    };

    window.addEventListener('openChat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('openChat', handleOpenChat as EventListener);
    };
  }, [navigate]);

  // --- QUYẾT ĐỊNH HIỂN THỊ DỰA TRÊN Context ---
  if (!app.isLoggedIn) {
    return null;
  }

  // Ẩn button khi đang ở trang chat
  if (location.pathname === '/chat') {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl"
      title="Tin nhắn"
    >
      <MessageCircle className="h-6 w-6" />
      {totalUnreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
          {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
        </span>
      )}
    </button>
  );
}
