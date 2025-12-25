import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Bell, ChevronDown, Clock, Package } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAppContext } from '../../providers/AppProvider';
import { mapBackendNotificationToNotification } from '../../utils/notificationMapper';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
export function NotificationLog() {
    const app = useAppContext();
    const navigate = useNavigate();
    const notificationContext = useNotificationContext();
    // Chỉ hiển thị khi user đã đăng nhập
    if (!app.isLoggedIn) {
        return null;
    }
    const [isExpanded, setIsExpanded] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const notificationsRef = useRef([]);
    // Cập nhật recent notifications khi có notification mới
    useEffect(() => {
        if (notificationContext?.notifications) {
            const mapped = notificationContext.notifications.map(mapBackendNotificationToNotification);
            notificationsRef.current = mapped;
            // Chỉ lấy 5 notifications mới nhất
            const recent = mapped
                .filter(n => !n.isRead)
                .slice(0, 5);
            setRecentNotifications(recent);
            // Tự động expand nếu có notification mới chưa đọc
            if (recent.length > 0 && !isExpanded) {
                setIsExpanded(true);
            }
        }
    }, [notificationContext?.notifications, notificationContext?.unreadCount]);
    const unreadCount = notificationContext?.unreadCount ?? 0;
    const hasUnread = unreadCount > 0;
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return Package;
            case 'shipping':
                return Package;
            case 'promotion':
                return Bell;
            case 'review':
                return AlertCircle;
            case 'system':
                return AlertCircle;
            default:
                return Bell;
        }
    };
    const getNotificationColor = (type) => {
        switch (type) {
            case 'order':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'shipping':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'promotion':
                return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            case 'review':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'system':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };
    const handleMarkAsRead = (id) => {
        notificationContext?.markAsRead(id);
    };
    const handleNotificationClick = (notification) => {
        handleMarkAsRead(notification.id);
        const productId = notification?.metadata?.productId;
        const reviewId = notification?.metadata?.reviewId;
        if (productId) {
            const url = reviewId ? `/product/${productId}?reviewId=${reviewId}&openReply=1&focusReview=1` : `/product/${productId}`;
            navigate(url);
            setIsExpanded(false);
        }
    };
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    if (!notificationContext || !hasUnread) {
        return null;
    }
    return (_jsx("div", { className: "fixed bottom-24 right-6 z-40", children: _jsx(AnimatePresence, { children: isExpanded ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 20, scale: 0.95 }, transition: { duration: 0.2 }, className: "w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-lg overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b border-border bg-muted/30", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Bell, { className: "w-4 h-4 text-primary" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold", children: "Th\u00F4ng b\u00E1o m\u1EDBi" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [unreadCount, " ch\u01B0a \u0111\u1ECDc"] })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [unreadCount > 0 && (_jsx(Badge, { variant: "destructive", className: "text-xs", children: unreadCount > 99 ? '99+' : unreadCount })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-7 w-7 p-0", onClick: handleToggleExpand, children: _jsx(ChevronDown, { className: "w-4 h-4" }) })] })] }), _jsx(ScrollArea, { className: "max-h-[400px]", children: _jsx("div", { className: "p-2 space-y-2", children: recentNotifications.length === 0 ? (_jsx("div", { className: "text-center py-8 text-sm text-muted-foreground", children: "Kh\u00F4ng c\u00F3 th\u00F4ng b\u00E1o m\u1EDBi" })) : (recentNotifications.map((notification) => {
                                const IconComponent = getNotificationIcon(notification.type);
                                const colorClass = getNotificationColor(notification.type);
                                return (_jsx(motion.div, { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -10 }, className: cn("group relative p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md", colorClass, !notification.isRead && "border-l-4"), onClick: () => handleNotificationClick(notification), children: _jsxs("div", { className: "flex gap-2", children: [_jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass), children: _jsx(IconComponent, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: "text-sm font-medium line-clamp-1", children: notification.title }), !notification.isRead && (_jsx("div", { className: "w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" }))] }), _jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1", children: notification.message }), _jsxs("div", { className: "flex items-center gap-1 mt-2 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: notification.time })] })] })] }) }, notification.id));
                            })) }) }), _jsx("div", { className: "p-2 border-t border-border bg-muted/30", children: _jsx(Button, { variant: "ghost", size: "sm", className: "w-full text-xs", onClick: () => {
                                // Dispatch event để mở notification sidebar (MainLayout sẽ lắng nghe)
                                window.dispatchEvent(new CustomEvent('openNotifications'));
                            }, children: "Xem t\u1EA5t c\u1EA3 th\u00F4ng b\u00E1o" }) })] })) : (_jsxs(motion.button, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: handleToggleExpand, className: cn("w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative", "bg-primary text-primary-foreground hover:bg-primary/90", "transition-all duration-200"), children: [_jsx(Bell, { className: "w-5 h-5" }), unreadCount > 0 && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "absolute -top-1 -right-1", children: _jsx(Badge, { variant: "destructive", className: "w-5 h-5 p-0 flex items-center justify-center text-xs font-bold", children: unreadCount > 99 ? '99+' : unreadCount }) }))] })) }) }));
}
