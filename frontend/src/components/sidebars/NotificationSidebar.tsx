import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Package,
  Star,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { Notification } from 'types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export function NotificationSidebar({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: NotificationSidebarProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

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

        {notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
              <Bell className="w-16 h-16 text-primary/60" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Chưa có thông báo</h3>
              <p className="text-muted-foreground text-sm max-w-[280px]">
                Bạn sẽ nhận được thông báo về đơn hàng, khuyến mãi và cập nhật mới nhất tại đây
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Action buttons */}
            {unreadCount > 0 && (
              <div className="px-6 py-3 border-b border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onMarkAllAsRead}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Đánh dấu tất cả đã đọc
                </Button>
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className="flex-1 px-6 min-h-0">
              <div className="space-y-4 py-4">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`group relative p-4 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer ${
                        !notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
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
                                onDeleteNotification(notification.id);
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
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}