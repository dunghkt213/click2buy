import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { CartItem } from 'types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface CartPreviewProps {
  items: CartItem[];
  totalPrice: number;
  onViewCart: () => void;
}

export function CartPreview({ items, totalPrice, onViewCart }: CartPreviewProps) {
  // Chỉ hiển thị tối đa 3 sản phẩm
  const displayItems = items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  if (items.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Giỏ hàng trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Sản phẩm mới thêm</h3>
          <span className="text-sm text-muted-foreground">{items.length} sản phẩm</span>
        </div>

        <Separator className="mb-3" />

        {/* Danh sách sản phẩm */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {displayItems.map((item) => (
            <div key={item.id} className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
              {/* Hình ảnh */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thông tin */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium line-clamp-1 break-words">{item.name}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">x{item.quantity}</span>
                  <span className="text-sm font-semibold text-primary shrink-0 whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {hasMoreItems && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                + {items.length - 3} sản phẩm khác
              </p>
            </div>
          )}
        </div>

        <Separator className="my-3" />

        {/* Tổng tiền */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className="text-sm text-muted-foreground shrink-0">Tổng tạm tính:</span>
          <span className="font-semibold shrink-0 whitespace-nowrap">{formatPrice(totalPrice)}</span>
        </div>

        {/* Button xem giỏ hàng */}
        <Button 
          onClick={onViewCart}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Xem giỏ hàng
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
