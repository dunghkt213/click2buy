import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  MapPin, 
  Edit, 
  CreditCard, 
  Smartphone,
  Banknote,
  Truck,
  Clock,
  Gift,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Tag,
  Plus
} from 'lucide-react';
import { CartItem, Address, PaymentMethod, ShippingMethod } from '../../types';
import { formatPrice } from '../../lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[]; // Chỉ những sản phẩm đã được chọn
  totalPrice: number;
  onCheckout: (checkoutData: any) => void;
}

const defaultAddresses: Address[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Nguyen Van A',
    ward: 'Phường Xuân Thủy',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    isDefault: true
  },
  {
    id: '2',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '144 Xuan Thuy',
    ward: 'Phường Dịch Vọng Hậu',
    district: 'Quận Cầu Giấy',
    city: 'Hà Nội',
    isDefault: false
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bank',
    type: 'bank',
    name: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản qua ứng dụng ngân hàng',
    icon: '🏦',
    isRecommended: true,
    discount: 2
  },
  {
    id: 'zalopay',
    type: 'zalopay',
    name: 'ZaloPay',
    description: 'Thanh toán nhanh chóng, bảo mật',
    icon: '💙',
    discount: 1
  },
  {
    id: 'momo',
    type: 'momo',
    name: 'Ví MoMo',
    description: 'Thanh toán với ví điện tử MoMo',
    icon: '🟡'
  },
  {
    id: 'shopeepay',
    type: 'shopeepay',
    name: 'ShopeePay',
    description: 'Thanh toán với ví ShopeePay',
    icon: '🔶'
  },
  {
    id: 'credit-card',
    type: 'credit-card',
    name: 'Thẻ tín dụng/Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: '💳'
  },
  {
    id: 'cod',
    type: 'cod',
    name: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: '💰'
  }
];

const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    description: 'Giao trong 3-5 ngày làm việc',
    estimatedTime: '3-5 ngày',
    price: 30000,
    isRecommended: true
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    description: 'Giao trong 1-2 ngày làm việc',
    estimatedTime: '1-2 ngày',
    price: 50000
  },
  {
    id: 'same-day',
    name: 'Giao hàng trong ngày',
    description: 'Giao trong 4-6 giờ (khu vực nội thành)',
    estimatedTime: '4-6 giờ',
    price: 80000
  }
];

export function CheckoutModal({ isOpen, onClose, items, totalPrice, onCheckout }: CheckoutModalProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address>(defaultAddresses[0]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(paymentMethods[0]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(shippingMethods[0]);
  const [voucher, setVoucher] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = totalPrice >= 1000000 ? 0 : selectedShipping.price;
  const paymentDiscount = selectedPayment.discount ? (totalPrice * selectedPayment.discount / 100) : 0;
  const voucherDiscount = voucher === 'SAVE10' ? Math.min(totalPrice * 0.1, 100000) : 0;
  const totalDiscount = paymentDiscount + voucherDiscount;
  const finalTotal = totalPrice + shippingFee - totalDiscount;

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const checkoutData = {
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        shippingMethod: selectedShipping,
        items,
        subtotal: totalPrice,
        shippingFee,
        discount: totalDiscount,
        voucher: voucher || undefined,
        total: finalTotal,
        note: note || undefined
      };
      
      onCheckout(checkoutData);
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const applyVoucher = () => {
    // Simple voucher logic
    if (voucher === 'SAVE10') {
      // Already applied in calculations
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-none !w-[70vw] !max-h-[98vh] p-0 overflow-hidden sm:rounded-xl">
        <div className="flex flex-col h-[98vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span>Thanh toán đơn hàng</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground ml-13">
              {items.length} sản phẩm • {totalItems} món hàng
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col xl:flex-row gap-6 p-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6 min-w-0">
                {/* Shipping Address */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Địa chỉ giao hàng</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Thay đổi
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {defaultAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAddress.id === address.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{address.name}</span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-muted-foreground">{address.phone}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Mặc định
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.address}, {address.ward}, {address.district}, {address.city}
                            </p>
                          </div>
                          {selectedAddress.id === address.id && (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Phương thức thanh toán</h3>
                  </div>
                  
                  <RadioGroup 
                    value={selectedPayment.id} 
                    onValueChange={(value) => {
                      const method = paymentMethods.find(m => m.id === value);
                      if (method) setSelectedPayment(method);
                    }}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPayment.id === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} />
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{method.name}</span>
                              {method.isRecommended && (
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                                  Khuyên dùng
                                </Badge>
                              )}
                              {method.discount && (
                                <Badge variant="secondary" className="text-xs bg-red-50 text-red-700">
                                  -{method.discount}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Shipping Method */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Phương thức vận chuyển</h3>
                  </div>
                  
                  <RadioGroup 
                    value={selectedShipping.id} 
                    onValueChange={(value) => {
                      const method = shippingMethods.find(m => m.id === value);
                      if (method) setSelectedShipping(method);
                    }}
                    className="space-y-3"
                  >
                    {shippingMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedShipping.id === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} />
                        <div className="flex items-center justify-between flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{method.name}</span>
                              {method.isRecommended && (
                                <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                                  Khuyên dùng
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {totalPrice >= 1000000 ? (
                                <span className="text-green-600">Miễn phí</span>
                              ) : (
                                formatPrice(method.price)
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{method.estimatedTime}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Voucher */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Mã giảm giá</h3>
                  </div>
                  
                  <div className="flex gap-3">
                    <Input
                      placeholder="Nhập mã giảm giá (VD: SAVE10)"
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={applyVoucher} variant="outline">
                      Áp dụng
                    </Button>
                  </div>
                  
                  {voucher === 'SAVE10' && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Mã giảm giá đã được áp dụng! Giảm {formatPrice(voucherDiscount)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <Label htmlFor="note" className="flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4" />
                    Ghi chú cho đơn hàng (tùy chọn)
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Ghi chú cho người bán..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>

                {/* Order Summary Sidebar */}
                <div className="xl:w-96 w-full xl:flex-shrink-0 space-y-6">
                  {/* Order Items */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Đơn hàng ({items.length} sản phẩm)</h3>
                    
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-12 h-12 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 mb-1">{item.name}</h4>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">{item.rating}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Chi tiết thanh toán</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính ({totalItems} sản phẩm)</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Phí vận chuyển</span>
                        <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                          {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                        </span>
                      </div>
                      
                      {paymentDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Giảm giá thanh toán</span>
                          <span>-{formatPrice(paymentDiscount)}</span>
                        </div>
                      )}
                      
                      {voucherDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Mã giảm giá</span>
                          <span>-{formatPrice(voucherDiscount)}</span>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        Giao dịch được bảo mật
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Thông tin thanh toán của bạn được mã hóa và bảo vệ an toàn
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full h-12 text-base font-semibold" 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Đang xử lý...
                      </div>
                    ) : (
                      <>Đặt hàng • {formatPrice(finalTotal)}</>
                    )}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}