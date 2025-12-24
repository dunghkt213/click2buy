import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { AlertCircle, Bell, CheckCircle, Clock, Package, Star, Tag, Truck, X, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { mapBackendNotificationToNotification } from '../../utils/notificationMapper';
import { useMemo } from 'react';
export function NotificationSidebar({ isOpen, onClose, notifications: legacyNotifications, onMarkAsRead: legacyMarkAsRead, onMarkAllAsRead: legacyMarkAllAsRead, onDeleteNotification: legacyDeleteNotification }) {
    // Sử dụng NotificationContext nếu có, fallback về legacy props
    const notificationContext = useNotificationContext();
    // Map backend notifications sang frontend format
    const mappedNotifications = useMemo(() => {
        if (notificationContext) {
            return notificationContext.notifications.map(mapBackendNotificationToNotification);
        }
        return legacyNotifications || [];
    }, [notificationContext?.notifications, legacyNotifications]);
    const unreadCount = notificationContext?.unreadCount ?? mappedNotifications.filter(n => !n.isRead).length;
    const isLoading = notificationContext?.isLoading ?? false;
    const handleMarkAsRead = (id) => {
        if (notificationContext) {
            notificationContext.markAsRead(id);
        }
        else if (legacyMarkAsRead) {
            legacyMarkAsRead(id);
        }
    };
    const handleMarkAllAsRead = () => {
        if (notificationContext) {
            notificationContext.markAllAsRead();
        }
        else if (legacyMarkAllAsRead) {
            legacyMarkAllAsRead();
        }
    };
    const handleDeleteNotification = (id) => {
        // Note: Backend không có delete notification, chỉ có thể đánh dấu đã đọc
        // Nếu cần delete, có thể implement sau
        if (legacyDeleteNotification) {
            legacyDeleteNotification(id);
        }
    };
    const notifications = mappedNotifications;
    const motionEase = [0.4, 0, 0.2, 1];
    const contentVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } }
    };
    const listVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, x: 12 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: motionEase } }
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return Package;
            case 'shipping':
                return Truck;
            case 'promotion':
                return Tag;
            case 'review':
                return Star;
            case 'system':
                return AlertCircle;
            default:
                return Bell;
        }
    };
    const getNotificationColor = (type) => {
        switch (type) {
            case 'order':
                return 'text-blue-600';
            case 'shipping':
                return 'text-green-600';
            case 'promotion':
                return 'text-orange-600';
            case 'review':
                return 'text-yellow-600';
            case 'system':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };
    return (_jsx(Sheet, { open: isOpen, onOpenChange: onClose, children: _jsx(SheetContent, { className: "w-full sm:w-[400px] flex flex-col p-0 h-full max-h-screen", children: _jsxs(motion.div, { className: "flex flex-col h-full", variants: contentVariants, initial: "hidden", animate: "visible", children: [_jsx("div", { className: "px-6 py-4 border-b border-border bg-card", children: _jsx(SheetHeader, { children: _jsxs(SheetTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center", children: _jsx(Bell, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { children: [_jsx("h2", { children: "Th\u00F4ng b\u00E1o" }), _jsxs(SheetDescription, { children: [unreadCount, " th\u00F4ng b\u00E1o m\u1EDBi"] })] })] }), unreadCount > 0 && (_jsx(Badge, { variant: "secondary", className: "bg-primary/10 text-primary", children: unreadCount }))] }) }) }), isLoading ? (_jsxs(motion.div, { className: "flex-1 flex flex-col items-center justify-center space-y-6 px-6", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }, children: [_jsx(Loader2, { className: "w-16 h-16 text-primary animate-spin" }), _jsx("div", { className: "text-center space-y-2", children: _jsx("h3", { className: "text-lg font-semibold", children: "\u0110ang t\u1EA3i th\u00F4ng b\u00E1o..." }) })] })) : notifications.length === 0 ? (_jsxs(motion.div, { className: "flex-1 flex flex-col items-center justify-center space-y-6 px-6", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }, children: [_jsx("div", { className: "w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center", children: _jsx(Bell, { className: "w-16 h-16 text-primary/60" }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Ch\u01B0a c\u00F3 th\u00F4ng b\u00E1o" }), _jsx("p", { className: "text-muted-foreground text-sm max-w-[280px]", children: "B\u1EA1n s\u1EBD nh\u1EADn \u0111\u01B0\u1EE3c th\u00F4ng b\u00E1o v\u1EC1 \u0111\u01A1n h\u00E0ng, khuy\u1EBFn m\u00E3i v\u00E0 c\u1EADp nh\u1EADt m\u1EDBi nh\u1EA5t t\u1EA1i \u0111\u00E2y" })] })] })) : (_jsxs(_Fragment, { children: [unreadCount > 0 && (_jsx("div", { className: "px-6 py-3 border-b border-border", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: handleMarkAllAsRead, className: "w-full", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-2" }), "\u0110\u00E1nh d\u1EA5u t\u1EA5t c\u1EA3 \u0111\u00E3 \u0111\u1ECDc"] }) })), _jsx(ScrollArea, { className: "flex-1 px-6 min-h-0", children: _jsx(motion.div, { className: "space-y-4 py-4", variants: listVariants, initial: "hidden", animate: "visible", children: notifications.map((notification) => {
                                        const IconComponent = getNotificationIcon(notification.type);
                                        const iconColor = getNotificationColor(notification.type);
                                        return (_jsxs(motion.div, { variants: itemVariants, className: `group relative p-4 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'}`, onClick: () => handleMarkAsRead(notification.id), children: [!notification.isRead && (_jsx("div", { className: "absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" })), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 ${iconColor} flex-shrink-0`, children: _jsx(IconComponent, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h4", { className: "font-medium text-sm leading-relaxed", children: notification.title }), _jsx(Button, { variant: "ghost", size: "sm", className: "w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity", onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteNotification(notification.id);
                                                                            }, children: _jsx(X, { className: "w-3 h-3" }) })] }), _jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: notification.message }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: notification.time })] })] })] })] }, notification.id));
                                    }) }) }), _jsx(motion.div, { className: "p-6 border-t border-border bg-muted/30", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } }, children: _jsx(Button, { variant: "outline", className: "w-full", onClick: onClose, children: "\u0110\u00F3ng" }) })] }))] }) }) }));
}
