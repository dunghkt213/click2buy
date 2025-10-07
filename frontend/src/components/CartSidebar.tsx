import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  Trash2, 
  Shield,
  Star,
  ArrowRight,
  Truck
} from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../lib/utils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleSelectItem: (id: string) => void;
  onSelectAllItems: () => void;
  onDeselectAllItems: () => void;
  selectedTotalPrice: number;
  selectedItems: CartItem[];
  onCheckout: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onSelectAllItems,
  onDeselectAllItems,
  selectedTotalPrice,
  selectedItems,
  onCheckout
}: CartSidebarProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedItemsCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = items.length > 0 && items.every(item => item.selected);
  const someSelected = items.some(item => item.selected);
  const shippingFee = selectedTotalPrice >= 1000000 ? 0 : 30000;
  const discount = selectedTotalPrice >= 2000000 ? selectedTotalPrice * 0.05 : 0;
  const finalTotal = selectedTotalPrice + shippingFee - discount;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[480px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2>Giỏ hàng</h2>
                  <SheetDescription>
                    {items.length > 0 ? `${items.length} sản phẩm` : 'Chưa có sản phẩm nào'}
                  </SheetDescription>
                </div>
              </div>
              {items.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 px-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-primary/60" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Giỏ hàng trống</h3>
              <p className="text-muted-foreground text-sm max-w-[280px]">
                Khám phá hàng ngàn sản phẩm chất lượng và thêm vào giỏ hàng của bạn
              </p>
            </div>
            <Button onClick={onClose} className="px-8">
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="px-6 py-3 border-b border-border bg-muted/20">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => allSelected ? onDeselectAllItems() : onSelectAllItems()}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm font-medium">
                  Chọn tất cả ({items.length} sản phẩm)
                </span>
                {someSelected && !allSelected && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedItems.length} đã chọn
                  </Badge>
                )}
              </div>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              <div className="px-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`group relative bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                        item.selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'
                      }`}
                    >
                      {/* Sale badge */}
                      {item.isSale && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground z-10">
                          SALE
                        </Badge>
                      )}
                      
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex items-start pt-1">
                          <Checkbox
                            checked={item.selected || false}
                            onCheckedChange={() => onToggleSelectItem(item.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>

                        <div className="relative w-20 h-20 bg-muted/20 rounded-xl overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                                {item.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">
                                  {item.rating} ({item.reviews})
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-7 w-7 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-semibold text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              {item.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  {formatPrice(item.originalPrice * item.quantity)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="bg-muted/30 border-t border-border p-6 space-y-4">
              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Bảo hành chính hãng
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Giao hàng nhanh
                  </span>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({selectedItemsCount} sản phẩm đã chọn)</span>
                  <span>{formatPrice(selectedTotalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá (5%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-lg text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full h-12 text-base gap-2" 
                  onClick={onCheckout}
                  disabled={selectedItems.length === 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      Mua hàng ({selectedItems.length})
                    </span>
                    <span className="flex items-center gap-1">
                      {formatPrice(finalTotal)}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Button>
                <Button variant="outline" className="w-full h-10" onClick={onClose}>
                  Tiếp tục mua sắm
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}