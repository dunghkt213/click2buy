import { jsx as _jsx } from "react/jsx-runtime";
/**
 * NotificationContext - Context để quản lý notification state và actions từ bất kỳ đâu trong app
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { useAppContext } from '../providers/AppProvider';
const NotificationContext = createContext(null);
export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
}
export function NotificationProvider({ children }) {
    const app = useAppContext();
    const userId = app.user?.id || null;
    const isLoggedIn = app.isLoggedIn;
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    // Handler khi nhận notification mới từ WebSocket
    const handleNotification = useCallback((notification) => {
        setNotifications((prev) => {
            // Kiểm tra xem notification đã tồn tại chưa (tránh duplicate)
            const exists = prev.some((n) => n._id === notification._id);
            if (exists) {
                return prev;
            }
            // Thêm notification mới vào đầu danh sách
            return [notification, ...prev];
        });
        // Tăng unread count nếu notification chưa đọc
        if (!notification.isRead) {
            setUnreadCount((prev) => prev + 1);
        }
    }, []);
    // Handler khi nhận danh sách notifications từ WebSocket
    const handleNotificationsList = useCallback((notificationsList) => {
        setNotifications(notificationsList);
        setIsLoading(false);
    }, []);
    // Handler khi nhận unread count từ WebSocket
    const handleUnreadCount = useCallback((count) => {
        setUnreadCount(count);
    }, []);
    // Handler khi đánh dấu đã đọc
    const handleMarkedRead = useCallback((notification) => {
        setNotifications((prev) => prev.map((n) => (n._id === notification._id ? notification : n)));
        // Giảm unread count nếu notification vừa được đánh dấu đã đọc
        if (notification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    }, []);
    // Kết nối WebSocket
    const { isConnected, getNotifications, getUnreadCount, markAsRead: wsMarkAsRead } = useNotificationSocket({
        userId,
        isLoggedIn,
        onNotification: handleNotification,
        onNotificationsList: handleNotificationsList,
        onUnreadCount: handleUnreadCount,
        onMarkedRead: handleMarkedRead,
    });
    // Mark as read function
    const markAsRead = useCallback((notificationId) => {
        // Cập nhật local state ngay lập tức (optimistic update)
        setNotifications((prev) => prev.map((n) => n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // Gửi request qua WebSocket
        wsMarkAsRead(notificationId);
    }, [wsMarkAsRead]);
    // Mark all as read
    const markAllAsRead = useCallback(() => {
        // Cập nhật local state
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
        setUnreadCount(0);
        // Gửi request cho từng notification chưa đọc
        notifications
            .filter((n) => !n.isRead)
            .forEach((n) => {
            wsMarkAsRead(n._id);
        });
    }, [notifications, wsMarkAsRead]);
    // Refresh notifications
    const refreshNotifications = useCallback(() => {
        if (isConnected) {
            setIsLoading(true);
            getNotifications();
        }
    }, [isConnected, getNotifications]);
    // Refresh unread count
    const refreshUnreadCount = useCallback(() => {
        if (isConnected) {
            getUnreadCount();
        }
    }, [isConnected, getUnreadCount]);
    // Auto refresh khi kết nối
    useEffect(() => {
        if (isConnected && userId) {
            refreshNotifications();
            refreshUnreadCount();
        }
    }, [isConnected, userId, refreshNotifications, refreshUnreadCount]);
    return (_jsx(NotificationContext.Provider, { value: {
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            refreshNotifications,
            refreshUnreadCount,
            isConnected,
        }, children: children }));
}
