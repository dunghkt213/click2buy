import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { API_BASE_URL } from '../apis/client/baseUrl';
export function useNotificationSocket({ userId, isLoggedIn, onNotification, onNotificationsList, onUnreadCount, onMarkedRead, }) {
    const socketRef = useRef(null);
    const callbacksRef = useRef({
        onNotification,
        onNotificationsList,
        onUnreadCount,
        onMarkedRead,
    });
    const [isConnected, setIsConnected] = useState(false);
    // ✅ LUÔN CẬP NHẬT CALLBACK MỚI NHẤT
    useEffect(() => {
        callbacksRef.current = {
            onNotification,
            onNotificationsList,
            onUnreadCount,
            onMarkedRead,
        };
    }, [onNotification, onNotificationsList, onUnreadCount, onMarkedRead]);
    // ✅ CHỈ KẾT NỐI / NGẮT KHI LOGIN THAY ĐỔI
    useEffect(() => {
        if (!isLoggedIn || !userId) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }
        // ❗ ĐÃ CÓ SOCKET → KHÔNG TẠO LẠI
        if (socketRef.current)
            return;
        const socket = io(`${API_BASE_URL}/notification`, {
            withCredentials: true,
            transports: ['websocket'],
            query: {
                userId: userId,
            },
        });
        socketRef.current = socket;
        socket.on('connect', () => {
            console.log('🔌 Notification WS connected');
            setIsConnected(true);
            // Request notifications list và unread count khi kết nối
            socket.emit('get_notifications', { userId });
            socket.emit('get_unread', { userId });
        });
        socket.on('disconnect', () => {
            console.log('❌ Notification WS disconnected');
            setIsConnected(false);
        });
        socket.on('connected', (data) => {
            console.log('📨 Notification socket connected:', data);
        });
        // Nhận notification realtime từ backend
        socket.on('notification', (notification) => {
            console.log('📨 New notification received:', notification);
            callbacksRef.current.onNotification?.(notification);
            // Hiển thị toast cho notification mới
            const title = (notification?.title || 'Thông báo mới').trim();
            const description = (notification?.content || '').trim();
            toast.info(title, {
                ...(description ? { description } : {}),
                duration: 6000,
            });
        });
        // Nhận danh sách notifications
        socket.on('notifications_list', (result) => {
            console.log('📋 Notifications list received:', result);
            if (result?.success && Array.isArray(result.data)) {
                callbacksRef.current.onNotificationsList?.(result.data);
            }
        });
        // Nhận số lượng chưa đọc
        socket.on('unread_count', (result) => {
            console.log('🔢 Unread count received:', result);
            if (result?.success && result.data?.unreadCount !== undefined) {
                callbacksRef.current.onUnreadCount?.(result.data.unreadCount);
            }
        });
        // Nhận xác nhận đánh dấu đã đọc
        socket.on('marked_read', (result) => {
            console.log('✅ Marked read received:', result);
            if (result?.success && result.data) {
                callbacksRef.current.onMarkedRead?.(result.data);
            }
        });
        return () => {
            console.log('🧹 Notification WS cleanup');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isLoggedIn, userId]);
    // Helper functions để gửi messages
    const getNotifications = useCallback(() => {
        if (socketRef.current && userId) {
            socketRef.current.emit('get_notifications', { userId });
        }
    }, [userId]);
    const getUnreadCount = useCallback(() => {
        if (socketRef.current && userId) {
            socketRef.current.emit('get_unread', { userId });
        }
    }, [userId]);
    const markAsRead = useCallback((notificationId) => {
        if (socketRef.current && userId) {
            socketRef.current.emit('mark_as_read', { userId, notificationId });
        }
    }, [userId]);
    return {
        isConnected,
        getNotifications,
        getUnreadCount,
        markAsRead,
    };
}
