import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  onViewOrder: () => void;
  onContinueShopping: () => void;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  orderNumber,
  onViewOrder,
  onContinueShopping
}: OrderSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 pb-4">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
            
            <div className="text-center">
              <DialogTitle className="text-2xl mb-2">
                Đặt hàng thành công!
              </DialogTitle>
              <DialogDescription className="text-base">
                Cảm ơn bạn đã mua sắm tại ShopMart
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
            <p className="font-mono font-semibold">{orderNumber}</p>
          </div>
        )}

        {/* Info Message */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">
            Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ gửi thông báo khi đơn hàng được xác nhận.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {/* View Order Button */}
          <Button 
            onClick={onViewOrder}
            className="w-full gap-2"
            size="lg"
          >
            <Package className="w-4 h-4" />
            Xem thông tin đơn hàng
          </Button>

          {/* Continue Shopping Button */}
          <Button 
            onClick={onContinueShopping}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <ShoppingBag className="w-4 h-4" />
            Quay lại mua sắm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
