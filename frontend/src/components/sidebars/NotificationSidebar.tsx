import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Loader2,
  Package,
  Star,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from 'types';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { mapBackendNotificationToNotification } from '../../utils/notificationMapper';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Legacy props - giữ lại để tương thích, nhưng sẽ dùng context thay thế
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
}

export function NotificationSidebar({
  isOpen,
  onClose,
  notifications: legacyNotifications,
  onMarkAsRead: legacyMarkAsRead,
  onMarkAllAsRead: legacyMarkAllAsRead,
  onDeleteNotification: legacyDeleteNotification
}: NotificationSidebarProps) {
  const navigate = useNavigate();
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

  const handleMarkAsRead = (id: string) => {
    if (notificationContext) {
      notificationContext.markAsRead(id);
    } else if (legacyMarkAsRead) {
      legacyMarkAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (notificationContext) {
      notificationContext.markAllAsRead();
    } else if (legacyMarkAllAsRead) {
      legacyMarkAllAsRead();
    }
  };

  const handleDeleteNotification = (id: string) => {
    // Note: Backend không có delete notification, chỉ có thể đánh dấu đã đọc
    // Nếu cần delete, có thể implement sau
    if (legacyDeleteNotification) {
      legacyDeleteNotification(id);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    const productId = (notification as any)?.metadata?.productId;
    const reviewId = (notification as any)?.metadata?.reviewId;

    if (productId) {
      const url = reviewId ? `/product/${productId}?reviewId=${reviewId}&openReply=1&focusReview=1` : `/product/${productId}`;
      onClose();
      navigate(url);
    }
  };

  const notifications = mappedNotifications;
  const motionEase = [0.4, 0, 0.2, 1] as const;
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

  const getNotificationIcon = (type: string) => {
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

  const getNotificationColor = (type: string) => {
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[400px] flex flex-col p-0 h-full max-h-screen">
        <motion.div
          className="flex flex-col h-full"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-card">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2>Thông báo</h2>
                    <SheetDescription>
                      {unreadCount} thông báo mới
                    </SheetDescription>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {unreadCount}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
          </div>

          {isLoading ? (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center space-y-6 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }}
            >
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Đang tải thông báo...</h3>
              </div>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center space-y-6 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                <Bell className="w-16 h-16 text-primary/60" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Chưa có thông báo</h3>
                <p className="text-muted-foreground text-sm max-w-[280px]">
                  Bạn sẽ nhận được thông báo về đơn hàng, khuyến mãi và cập nhật mới nhất tại đây
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Action buttons */}
              {unreadCount > 0 && (
                <div className="px-6 py-3 border-b border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Đánh dấu tất cả đã đọc
                  </Button>
                </div>
              )}

              {/* Notifications List */}
              <ScrollArea className="flex-1 px-6 min-h-0">
                <motion.div
                  className="space-y-4 py-4"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {notifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);

                    return (
                      <motion.div
                        key={notification.id}
                        variants={itemVariants}
                        className={`group relative p-4 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                        )}

                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 ${iconColor} flex-shrink-0`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm leading-relaxed">
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </ScrollArea>

              {/* Footer */}
              <motion.div
                className="p-6 border-t border-border bg-muted/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
              >
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Đóng
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}