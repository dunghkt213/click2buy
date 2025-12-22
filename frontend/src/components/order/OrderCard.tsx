/**
 * OrderCard - Component hiển thị thông tin một đơn hàng cho seller
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Order } from '../../types';
import { formatPrice } from '../../utils/utils';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => void;
  showActionButtons?: boolean; // Optional prop to show/hide action buttons
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Chờ xử lý', // PENDING_ACCEPT - đang chờ seller xác nhận
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancel_request: 'Yêu cầu hủy',
};

export function OrderCard({ order, onUpdateStatus, showActionButtons = true }: OrderCardProps) {
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  return (
    <Card key={order.id} className="overflow-hidden">
      <div className="p-4 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
          <Badge>{statusLabel}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-3 mb-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1 wrap-break-word">{item.name}</p>
                {item.variant && (
                  <p className="text-sm text-muted-foreground">{item.variant}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                <p className="font-medium">{formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Khách hàng: {order.shippingAddress.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng tiền:</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(order.finalPrice)}
              </p>
            </div>
          </div>
          {showActionButtons && order.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'confirmed')}
              >
                Xác nhận đơn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Hủy đơn?')) {
                    onUpdateStatus(order.id, 'cancelled');
                  }
                }}
              >
                Hủy đơn
              </Button>
            </div>
          )}
          {showActionButtons && order.status === 'confirmed' && (
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'confirm')}
              >
                Xác nhận
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn từ chối đơn hàng này?')) {
                    onUpdateStatus(order.id, 'reject');
                  }
                }}
              >
                Hủy đơn
              </Button>
            </div>
          )}
          {showActionButtons && order.status === 'cancel_request' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, 'accept_cancel')}
              >
                Xác nhận
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn từ chối yêu cầu hủy đơn hàng này?')) {
                    onUpdateStatus(order.id, 'reject_cancel');
                  }
                }}
              >
                Hủy đơn
              </Button>
            </div>
          )}
          {/* Removed "Hoàn thành đơn hàng" button for shipping status as requested */}
        </div>
      </div>
    </Card>
  );
}

