/**
 * CheckoutPage - Trang thanh toán đơn hàng
 * Chuyển từ modal sang page riêng với header, footer và nút quay lại
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Card } from '../../components/ui/card';
import { 
  ArrowLeft,
  MapPin, 
  Edit, 
  CreditCard, 
  Truck,
  Tag,
  Plus,
  Shield,
  CheckCircle,
  Star
} from 'lucide-react';
import { CartItem, Address, PaymentMethod, ShippingMethod, ShopCheckoutData } from '../../types';
import { formatPrice } from '../../utils/utils';
import { useAppContext } from '../../providers/AppProvider';
import { toast } from 'sonner';
// import { useSSE, PaymentQR } from '../../hooks/useSSE'; // Temporarily disabled
// import { QRPaymentModal } from '../../components/payment/QRPaymentModal';
// import { usePaymentSocket } from '@/hooks/usePaymentSocket';

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
    id: 'BANKING',
    type: 'BANKING',
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
    id: 'COD',
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

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const app = useAppContext();

  // Lấy items từ location.state (khi mua ngay) hoặc từ cart items đã chọn
  const [items] = useState<CartItem[]>(() => {
    // Nếu có items từ location.state (mua ngay)
    if (location.state?.items && Array.isArray(location.state.items)) {
      return location.state.items;
    }
    // Nếu không, lấy từ cart items đã chọn
    if (app.getSelectedItems) {
      return app.getSelectedItems();
    }
    return [];
  });

  const [selectedAddress, setSelectedAddress] = useState<Address>(defaultAddresses[0]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(paymentMethods[0]);
  const [shops, setShops] = useState<ShopCheckoutData[]>([]);
  const [systemVoucher, setSystemVoucher] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // QR Payment Modal states (temporarily disabled)
  // const [qrPayments, setQrPayments] = useState<PaymentQR[]>([]);
  // const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Group items by sellerId và tạo shop data
  useEffect(() => {
    if (!items || items.length === 0) {
      setShops([]);
      return;
    }

    const shopsMap = new Map<string, ShopCheckoutData>();

    items.forEach((item: CartItem) => {
      if (!item.sellerId) {
        console.warn("Item thiếu sellerId:", item);
        return;
      }

      const sellerId = item.sellerId;
      const subtotal = item.price * item.quantity;

      if (!shopsMap.has(sellerId)) {
        shopsMap.set(sellerId, {
          sellerId,
          sellerName: `Shop ${sellerId.slice(-4)}`,
          items: [],
          subtotal: 0,
          shippingMethod: shippingMethods[0], // Default shipping method
          shippingFee: 0, // Will be calculated later
          voucher: '',
          voucherDiscount: 0,
          total: 0
        });
      }

      const shop = shopsMap.get(sellerId)!;
      shop.items.push(item);
      shop.subtotal += subtotal;
    });

    // Calculate shipping fee for each shop
    const shopsArray = Array.from(shopsMap.values()).map(shop => {
      const shippingFee = shop.subtotal >= 1000000 ? 0 : shop.shippingMethod.price;
      const total = shop.subtotal + shippingFee - shop.voucherDiscount;

      return {
        ...shop,
        shippingFee,
        total
      };
    });

    setShops(shopsArray);
  }, [items]);

  // Scroll to top khi mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Nếu không có items, chuyển về cart
    if (!items || items.length === 0) {
      toast.error('Vui lòng chọn sản phẩm để thanh toán');
      navigate('/cart');
    }
  }, []);

  // SSE for payment updates - Temporarily disabled
  // const { isConnected } = usePaymentSocket({
  //   isLoggedIn: app.isLoggedIn,
  //   onQRCreated: (payments: PaymentQR[]) => {
  //     console.log('QR Created:', payments);
  //     setQrPayments(payments);
  //     setIsQrModalOpen(true);
  //     setIsProcessing(false); // Stop loading when QR is ready
  //   },
  //   onPaymentSuccess: (data: any) => {
  //     console.log('Payment Success:', data);
  //     setIsQrModalOpen(false);
  //     toast.success('Thanh toán thành công! Đang chuyển hướng...');
  //     // Navigate to orders page after a short delay
  //     setTimeout(() => {
  //       navigate('/orders');
  //     }, 2000);
  //   },
  //   onQRExpired: (data: any) => {
  //     console.log('QR Expired:', data);
  //     setIsQrModalOpen(false);
  //     toast.error('Mã QR đã hết hạn. Vui lòng thử lại.');
  //   },
  // });

  // Handlers for shop-specific data
  const updateShopShipping = (sellerId: string, shippingMethod: ShippingMethod) => {
    setShops(prev => prev.map(shop => {
      if (shop.sellerId === sellerId) {
        const shippingFee = shop.subtotal >= 1000000 ? 0 : shippingMethod.price;
        const total = shop.subtotal + shippingFee - shop.voucherDiscount;
        return {
          ...shop,
          shippingMethod,
          shippingFee,
          total
        };
      }
      return shop;
    }));
  };

  const updateShopVoucher = (sellerId: string, voucher: string) => {
    setShops(prev => prev.map(shop => {
      if (shop.sellerId === sellerId) {
        const voucherDiscount = voucher === 'SAVE10' ? Math.min(shop.subtotal * 0.1, 50000) : 0;
        const total = shop.subtotal + shop.shippingFee - voucherDiscount;
        return {
          ...shop,
          voucher,
          voucherDiscount,
          total
        };
      }
      return shop;
    }));
  };

  const applyShopVoucher = (sellerId: string) => {
    const shop = shops.find(s => s.sellerId === sellerId);
    if (shop?.voucher === 'SAVE10') {
      toast.success(`Mã giảm giá của shop ${shop.sellerName} đã được áp dụng!`);
    } else {
      toast.error('Mã giảm giá không hợp lệ');
    }
  };

  const applySystemVoucher = () => {
    if (systemVoucher === 'SYSTEM10') {
      toast.success('Mã giảm giá hệ thống đã được áp dụng!');
    } else {
      toast.error('Mã giảm giá hệ thống không hợp lệ');
    }
  };

  // Calculate totals
  const totalItems = shops.reduce((sum: number, shop) => sum + shop.items.reduce((shopSum, item) => shopSum + item.quantity, 0), 0);
  const totalSubtotal = shops.reduce((sum, shop) => sum + shop.subtotal, 0);
  const totalShippingFee = shops.reduce((sum, shop) => sum + shop.shippingFee, 0);
  const totalShopVoucherDiscount = shops.reduce((sum, shop) => sum + shop.voucherDiscount, 0);
  const paymentDiscount = selectedPayment.discount ? (totalSubtotal * selectedPayment.discount / 100) : 0;
  const systemVoucherDiscount = systemVoucher === 'SYSTEM10' ? Math.min(totalSubtotal * 0.1, 100000) : 0;
  const totalDiscount = paymentDiscount + totalShopVoucherDiscount + systemVoucherDiscount;
  const finalTotal = totalSubtotal + totalShippingFee - totalDiscount;

  const handleCheckout = async () => {
    if (!app.isLoggedIn) {
      app.handleLogin();
      return;
    }

    setIsProcessing(true);

    try {
      // Tạo carts payload từ shops data
      const carts = shops.map(shop => ({
        sellerId: shop.sellerId,
        products: shop.items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        voucherCode: shop.voucher || undefined,
        shippingFee: shop.shippingFee,
        paymentDiscount: selectedPayment.discount ? (shop.subtotal * selectedPayment.discount / 100) : 0
      }));

      const checkoutPayload = {
        orderCode: Date.now().toString(),
        paymentMethod: selectedPayment.id,
        carts,
        // Thông tin shipping address sẽ được BE lấy từ user profile
      };

      console.log('🛒 Checkout payload với shops:', checkoutPayload);

      console.log('🛒 Checkout payload với shops:', checkoutPayload);

      const orderResult = await app.handleCheckout(checkoutPayload);
      console.log('🧪 orderResult RAW:', orderResult);

      // Logic xử lý theo payment method
      if (selectedPayment.id === 'cod') {
        // COD: redirect thẳng đến orders
        toast.success('Đặt hàng thành công! Đơn hàng sẽ được giao trong 3-5 ngày.');
        navigate('/orders');
      } else {
        if (!orderResult?.orderCode) {
          toast.error('Không lấy được mã đơn hàng');
          return;
        }        
        // Banking/ZaloPay/MoMo/ShopeePay: redirect đến payment process để hiển thị QR
        navigate(`/payment/process/${orderResult.orderCode}`, {
          state: {
            orderCode: orderResult?.orderCode,
            totalAmount: finalTotal,
            paymentMethod: selectedPayment.type
          }
        });
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      setIsProcessing(false);
    }

    setIsProcessing(false);
  };
  
  

  // applyVoucher function removed - now handled per shop

  if (!items || items.length === 0) {
    return null; // Sẽ redirect về cart
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header với nút quay lại */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Thanh toán đơn hàng</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {shops.length} shop • {totalItems} món hàng
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Shipping Address */}
            <Card className="p-6">
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
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
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
            </Card>

            {/* Shops Sections */}
            {shops.map((shop) => (
              <Card key={shop.sellerId} className="p-6">
                <div className="space-y-6">
                  {/* Shop Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <h3 className="font-semibold text-lg">{shop.sellerName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {shop.items.length} sản phẩm • {shop.items.reduce((sum, item) => sum + item.quantity, 0)} món hàng
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Shop riêng
                    </Badge>
                  </div>

                  {/* Shop Items */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Sản phẩm</h4>
                    <div className="space-y-3">
                      {shop.items.map((item: CartItem) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
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
                            <h5 className="text-sm font-medium line-clamp-2 mb-1">{item.name}</h5>
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

                  {/* Shop Shipping Method */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Phương thức vận chuyển
                    </h4>
                    <RadioGroup
                      value={shop.shippingMethod.id}
                      onValueChange={(value) => {
                        const method = shippingMethods.find(m => m.id === value);
                        if (method) updateShopShipping(shop.sellerId, method);
                      }}
                      className="space-y-2"
                    >
                      {shippingMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                            shop.shippingMethod.id === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={method.id} />
                          <div className="flex items-center justify-between flex-1">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{method.name}</span>
                                {method.isRecommended && (
                                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                                    Khuyên dùng
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">
                                {shop.subtotal >= 1000000 ? (
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

                  {/* Shop Voucher */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Mã giảm giá shop
                    </h4>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Nhập mã giảm giá shop (VD: SAVE10)"
                        value={shop.voucher}
                        onChange={(e) => updateShopVoucher(shop.sellerId, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => applyShopVoucher(shop.sellerId)}
                        variant="outline"
                        size="sm"
                      >
                        Áp dụng
                      </Button>
                    </div>

                    {shop.voucher === 'SAVE10' && shop.voucherDiscount > 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Mã giảm giá đã được áp dụng! Giảm {formatPrice(shop.voucherDiscount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shop Summary */}
                  <div className="bg-muted/20 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính ({shop.items.length} sản phẩm)</span>
                      <span>{formatPrice(shop.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí vận chuyển</span>
                      <span className={shop.shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                        {shop.shippingFee === 0 ? "Miễn phí" : formatPrice(shop.shippingFee)}
                      </span>
                    </div>
                    {shop.voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Mã giảm giá shop</span>
                        <span>-{formatPrice(shop.voucherDiscount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng shop</span>
                      <span className="text-primary">{formatPrice(shop.total)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* System Voucher */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Mã giảm giá hệ thống</h3>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Nhập mã giảm giá hệ thống (VD: SYSTEM10)"
                  value={systemVoucher}
                  onChange={(e) => setSystemVoucher(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={applySystemVoucher} variant="outline">
                  Áp dụng
                </Button>
              </div>

              {systemVoucher === 'SYSTEM10' && systemVoucherDiscount > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Mã giảm giá hệ thống đã được áp dụng! Giảm {formatPrice(systemVoucherDiscount)}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Note */}
            <Card className="p-6">
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
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:w-96 w-full xl:flex-shrink-0 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Đơn hàng ({totalItems} sản phẩm)</h3>

              <div className="border border-border rounded-lg overflow-hidden">
                <ScrollArea className="h-[320px] w-full">
                  <div className="space-y-4 pr-4 py-2">
                    {shops.map((shop) => (
                      <div key={shop.sellerId} className="space-y-3">
                        {/* Shop Header */}
                        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                          <Badge variant="outline" className="text-xs">
                            {shop.sellerName}
                          </Badge>
                        </div>

                        {/* Shop Items */}
                        {shop.items.map((item: CartItem) => (
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
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Chi tiết thanh toán</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{formatPrice(totalSubtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển tổng</span>
                  <span className={totalShippingFee === 0 ? "text-green-600 font-medium" : ""}>
                    {totalShippingFee === 0 ? "Miễn phí" : formatPrice(totalShippingFee)}
                  </span>
                </div>

                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá thanh toán</span>
                    <span>-{formatPrice(paymentDiscount)}</span>
                  </div>
                )}

                {totalShopVoucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Mã giảm giá shops</span>
                    <span>-{formatPrice(totalShopVoucherDiscount)}</span>
                  </div>
                )}

                {systemVoucherDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Mã giảm giá hệ thống</span>
                    <span>-{formatPrice(systemVoucherDiscount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Giao dịch được bảo mật
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Thông tin thanh toán của bạn được mã hóa và bảo vệ an toàn
              </p>
            </Card>

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
      </div>

      {/* QR Payment Modal - Temporarily disabled */}
      {/* <QRPaymentModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payments={qrPayments}
        totalAmount={finalTotal}
        onPaymentSuccess={() => {
          setIsQrModalOpen(false);
          navigate('/orders');
        }}
      /> */}
    </div>
  );
}

