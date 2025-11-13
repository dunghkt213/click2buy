import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  MessageSquare,
  RotateCcw,
  Star,
  Copy,
  Check
} from 'lucide-react';
import { Order, OrderStatus } from 'types';
import { formatPrice } from '../../lib/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onCancelOrder?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onReview?: (orderId: string) => void;
  onContactShop?: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500', icon: CheckCircle },
  shipping: { label: 'Đang giao hàng', color: 'bg-purple-500', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500', icon: XCircle },
  refund: { label: 'Hoàn tiền', color: 'bg-orange-500', icon: RotateCcw },
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

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">Chi tiết đơn hàng</DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono">{order.orderNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyOrderNumber}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <Badge className={`${statusInfo.color} text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Timeline */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Trạng thái đơn hàng
              </h3>
              <div className="space-y-4">
                {order.timeline.map((item, index) => {
                  const itemStatusInfo = statusConfig[item.status];
                  const ItemIcon = itemStatusInfo.icon;
                  const isLast = index === order.timeline.length - 1;

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${itemStatusInfo.color} flex items-center justify-center`}>
                          <ItemIcon className="w-4 h-4 text-white" />
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-12 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Shipping Address */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ nhận hàng
              </h3>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {order.shippingAddress.phone}
                </p>
                <p className="text-sm">{order.shippingAddress.address}</p>
              </div>
            </Card>

            {/* Products */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Sản phẩm ({order.items.length})</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Phân loại: {item.variant}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                        <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment & Shipping Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Thanh toán
                </h3>
                <p className="text-sm">{order.paymentMethod}</p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Vận chuyển
                </h3>
                <p className="text-sm">{order.shippingMethod}</p>
                {order.trackingNumber && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Mã vận đơn: {order.trackingNumber}
                  </p>
                )}
              </Card>
            </div>

            {/* Note */}
            {order.note && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ghi chú
                </h3>
                <p className="text-sm">{order.note}</p>
              </Card>
            )}

            {/* Price Summary */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Tổng tiền</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính:</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá:</span>
                    <span className="text-green-600">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>

        <Separator />

        {/* Action Buttons */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3">
          {order.status === 'pending' && onCancelOrder && (
            <Button
              variant="destructive"
              onClick={() => onCancelOrder(order.id)}
            >
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

          {onContactShop && (
            <Button
              variant="outline"
              onClick={() => onContactShop(order.id)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Liên hệ Shop
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
