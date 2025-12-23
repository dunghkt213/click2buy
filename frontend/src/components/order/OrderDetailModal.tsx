import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Receipt,
  RotateCcw,
  Star,
  TrendingDown,
  Truck,
  Wallet,
  XCircle
} from 'lucide-react';
import React from 'react';
import { Order, OrderStatus } from 'types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onCancelOrder?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onReview?: (orderId: string) => void;
  onContactShop?: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: { 
    label: 'Đang chờ thanh toán', 
    color: 'text-yellow-700 dark:text-yellow-400', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    icon: Clock 
  },
  confirmed: { 
    label: 'Chờ xác nhận', 
    color: 'text-blue-700 dark:text-blue-400', 
    bgColor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    icon: CheckCircle 
  },
  shipping: { 
    label: 'Đang giao hàng', 
    color: 'text-purple-700 dark:text-purple-400', 
    bgColor: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    icon: Truck 
  },
  completed: { 
    label: 'Hoàn thành', 
    color: 'text-green-700 dark:text-green-400', 
    bgColor: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Đã hủy', 
    color: 'text-red-700 dark:text-red-400', 
    bgColor: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    icon: XCircle 
  },
  refund: { 
    label: 'Hoàn tiền', 
    color: 'text-orange-700 dark:text-orange-400', 
    bgColor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    icon: RotateCcw 
  },
};

// Default status config for unknown statuses
const defaultStatusConfig = { 
  label: 'Không xác định', 
  color: 'text-gray-700 dark:text-gray-400', 
  bgColor: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
  icon: Package 
};

// Helper function to get status config safely
const getStatusConfig = (status: string | undefined): { label: string; color: string; bgColor: string; icon: any } => {
  if (!status || !(status in statusConfig)) {
    return defaultStatusConfig;
  }
  return statusConfig[status as OrderStatus];
};

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onCancelOrder,
  onReorder,
  onReview,
  onContactShop
}: OrderDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const statusInfo = getStatusConfig(order.status);
  const StatusIcon = statusInfo.icon;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate payment method display
  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'COD': 'Thanh toán khi nhận hàng',
      'BANKING': 'Chuyển khoản ngân hàng',
      'zalopay': 'ZaloPay',
      'momo': 'MoMo',
      'shopeepay': 'ShopeePay',
      'credit-card': 'Thẻ tín dụng',
    };
    return methods[method] || method;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className={`relative ${statusInfo.bgColor} border-b`}>
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold mb-3">
                    Chi tiết đơn hàng
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border">
                      <Receipt className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Mã đơn:</span>
                      <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-1 hover:bg-muted"
                        onClick={handleCopyOrderNumber}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Đặt ngày:</span>
                      <span className="text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge 
                  className={`${statusInfo.bgColor} ${statusInfo.color} border px-4 py-2 text-sm font-semibold`}
                >
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.label}
                </Badge>
              </div>
            </DialogHeader>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Expires At Warning for Pending Payment */}
            {order.expiresAt && order.status === 'pending' && (
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                <div className="p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                      Hết hạn thanh toán
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Vui lòng thanh toán trước{' '}
                      <span className="font-semibold">
                        {new Date(order.expiresAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline - Enhanced Design */}
            {order.timeline && order.timeline.length > 0 && (
              <Card className="border-2">
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    Lịch sử đơn hàng
                  </h3>
                  <div className="space-y-4">
                    {order.timeline.map((item, index) => {
                      const itemStatusInfo = getStatusConfig(item.status);
                      const ItemIcon = itemStatusInfo.icon;
                      const isLast = index === order.timeline.length - 1;

                      return (
                        <div key={index} className="flex gap-4 relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full ${itemStatusInfo.bgColor} border-2 border-background flex items-center justify-center shadow-sm z-10`}>
                              <ItemIcon className={`w-5 h-5 ${itemStatusInfo.color}`} />
                            </div>
                            {!isLast && (
                              <div className="absolute left-[21px] top-10 w-0.5 h-full bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-6 pt-1">
                            <p className="font-semibold text-base mb-1">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Products Section - Enhanced */}
            <Card className="border-2">
              <div className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  Sản phẩm ({order.items.length})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-4 bg-muted/50 rounded-xl border hover:bg-muted/70 transition-colors"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-background border-2 flex-shrink-0 shadow-sm">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base line-clamp-2 mb-2">{item.name}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Phân loại: <span className="font-medium">{item.variant}</span>
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Số lượng: <span className="font-semibold text-foreground">{item.quantity}</span>
                          </span>
                          <span className="font-bold text-lg text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping Address */}
              <Card className="border-2">
                <div className="p-5">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Địa chỉ nhận hàng
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      // Parse address field if it exists (format: "Tên - SĐT - Địa chỉ")
                      let recipientName = '';
                      let recipientPhone = '';
                      let recipientAddress = '';
                      
                      if (order.address) {
                        const parts = order.address.split(' - ');
                        if (parts.length >= 3) {
                          recipientName = parts[0].trim();
                          recipientPhone = parts[1].trim();
                          recipientAddress = parts.slice(2).join(' - ').trim();
                        } else if (parts.length === 2) {
                          recipientName = parts[0].trim();
                          recipientPhone = parts[1].trim();
                          recipientAddress = '';
                        } else {
                          recipientAddress = order.address.trim();
                        }
                      }
                      
                      // Fallback to individual fields if address is not parsed
                      if (!recipientName) {
                        recipientName = order.shippingAddress?.name || order.user?.name || order.user?.username || 'N/A';
                      }
                      if (!recipientPhone) {
                        recipientPhone = order.shippingAddress?.phone || order.user?.phone || 'N/A';
                      }
                      if (!recipientAddress) {
                        recipientAddress = order.shippingAddress?.address || 'N/A';
                      }
                      
                      return (
                        <>
                          {/* Tên người nhận */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tên người nhận:</p>
                            <p className="font-semibold text-base">{recipientName}</p>
                          </div>
                          
                          {/* Số điện thoại */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Số điện thoại:</p>
                            <p className="text-sm text-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                              {recipientPhone}
                    </p>
                          </div>
                          
                          {/* Địa chỉ nhận hàng */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Địa chỉ nhận hàng:</p>
                            <p className="text-sm leading-relaxed break-words">{recipientAddress}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Card>

              {/* Payment & Shipping Info */}
              <div className="space-y-4">
                <Card className="border-2">
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      Phương thức thanh toán
                    </h3>
                    <p className="font-semibold text-base">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                </Card>

                <Card className="border-2">
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Vận chuyển
                    </h3>
                    <p className="font-semibold text-base mb-2">
                      {order.shippingMethod || 'Tiêu chuẩn'}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Mã vận đơn:</p>
                        <p className="font-mono font-semibold text-sm">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Note */}
            {order.note && (
              <Card className="border-2">
                <div className="p-5">
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Ghi chú
                  </h3>
                  <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                    {order.note}
                  </p>
                </div>
              </Card>
            )}

            {/* Price Summary - Enhanced */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  Tổng tiền
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(order.totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {order.shippingFee === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Miễn phí</span>
                      ) : (
                        formatPrice(order.shippingFee)
                      )}
                    </span>
                  </div>
                  {order.voucherDiscount && order.voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Giảm giá voucher:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatPrice(order.voucherDiscount)}
                      </span>
                    </div>
                  )}
                  {order.paymentDiscount && order.paymentDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Giảm giá thanh toán:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatPrice(order.paymentDiscount)}
                      </span>
                    </div>
                  )}
                  {order.discount > 0 && (!order.voucherDiscount || !order.paymentDiscount) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Giảm giá:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatPrice(order.discount)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-lg">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(order.finalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        {/* Action Buttons - Enhanced */}
        <div className="p-6 bg-muted/30 flex flex-wrap items-center justify-end gap-3">
          {order.status === 'pending' && onCancelOrder && (
            <Button
              variant="destructive"
              onClick={() => onCancelOrder(order.id)}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Hủy đơn hàng
            </Button>
          )}

          {order.status === 'completed' && onReview && (
            <Button
              variant="default"
              onClick={() => onReview(order.id)}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Đánh giá
            </Button>
          )}

          {onReorder && (
            <Button
              variant="outline"
              onClick={() => onReorder(order.id)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Mua lại
            </Button>
          )}

          {order.ownerId && (
            <Button
              variant="outline"
              onClick={() => {
                // Trigger chat với shop của đơn hàng
                const event = new CustomEvent('openChat', { detail: { targetUserId: order.ownerId } });
                window.dispatchEvent(event);
              }}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Liên hệ Shop
            </Button>
          )}

          <Button
            variant="default"
            onClick={onClose}
            className="gap-2"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
