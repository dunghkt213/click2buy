import { useState } from 'react';
export const useNotifications = (initialNotifications = []) => {
    const [notifications, setNotifications] = useState(initialNotifications);
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(notification => notification.id === id ? { ...notification, isRead: true } : notification));
    };
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    };
    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };
    const getUnreadCount = () => {
        return notifications.filter(n => !n.isRead).length;
    };
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
    };
    const clearAll = () => {
        setNotifications([]);
    };
    return {
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getUnreadCount,
        addNotification,
        clearAll
    };
};
