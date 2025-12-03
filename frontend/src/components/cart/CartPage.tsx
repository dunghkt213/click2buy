import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react'; // THÊM: useState
import { CartItem } from 'types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CheckoutModal } from '../payment/CheckoutModal'; // THÊM: Import CheckoutModal
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleSelectItem: (id: string) => void;
  onSelectAllItems: () => void;
  onDeselectAllItems: () => void;
  selectedTotalPrice: number;
  selectedItems: CartItem[];
  onCheckout: (checkoutData: any) => void; // THAY ĐỔI: Nhận checkoutData
  onBack: () => void;
}

export function CartPage({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onSelectAllItems,
  onDeselectAllItems,
  selectedTotalPrice,
  selectedItems,
  onCheckout,
  onBack
}: CartPageProps) {
  const allSelected = items.length > 0 && items.every(item => item.selected);
  const selectedCount = selectedItems.length;

  // THÊM: State cho CheckoutModal
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-semibold">Giỏ hàng của bạn</h1>
            <Badge variant="secondary" className="ml-2">
              {items.length} sản phẩm
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          // Empty cart
          <Card className="p-12">
            <div className="text-center">
              <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl mb-2">Giỏ hàng trống</h2>
              <p className="text-muted-foreground mb-6">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
                Tiếp tục mua sắm
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onSelectAllItems();
                        } else {
                          onDeselectAllItems();
                        }
                      }}
                    />
                    <label htmlFor="select-all" className="cursor-pointer select-none">
                      Chọn tất cả ({items.length} sản phẩm)
                    </label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedCount} sản phẩm đã chọn
                  </span>
                </div>
              </Card>

              {/* Cart Items */}
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`group relative p-4 transition-all duration-200 ${
                    item.selected
                      ? "border-primary shadow-md"
                      : "border-border hover:border-primary/20"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.selected || false}
                        onCheckedChange={() => onToggleSelectItem(item.id)}
                      />
                    </div>

                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium mb-1 line-clamp-2">{item.name}</h3>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              Phân loại: {item.variant}
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Price & Quantity */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Total for this item */}
                      <div className="flex justify-end mt-2">
                        <span className="text-sm text-muted-foreground">
                          Tổng: <span className="font-semibold text-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>

                <Separator className="mb-4" />

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Số sản phẩm đã chọn:</span>
                    <span>{selectedCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatPrice(selectedTotalPrice)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                </div>

                <Separator className="mb-4" />

                <div className="flex items-center justify-between mb-6">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(selectedTotalPrice)}
                  </span>
                </div>

                <Button
                  onClick={() => setCheckoutModalOpen(true)} // THAY ĐỔI: Mở CheckoutModal
                  disabled={selectedCount === 0}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Thanh toán ({selectedCount})
                </Button>

                {selectedCount === 0 && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Vui lòng chọn sản phẩm để thanh toán
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        items={selectedItems} // THAY ĐỔI: Truyền selectedItems thay vì selectedItems
        totalPrice={selectedTotalPrice}
        onCheckout={onCheckout}
      />
    </div>
  );
}