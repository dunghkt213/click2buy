import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  AlertCircle,
  ArrowLeft,
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
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAppContext } from '../../providers/AppProvider';
import { toast } from 'sonner';
import { productApi } from '../../apis/product/productApi';
import { orderService } from '../../apis/order';
import { mapOrderResponse } from '../../apis/order/order.mapper';

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

const defaultStatusConfig = { 
  label: 'Không xác định', 
  color: 'text-gray-700 dark:text-gray-400', 
  bgColor: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
  icon: Package 
};

const getStatusConfig = (status: string | undefined): { label: string; color: string; bgColor: string; icon: any } => {
  if (!status || !(status in statusConfig)) {
    return defaultStatusConfig;
  }
  return statusConfig[status as OrderStatus];
};

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const app = useAppContext();
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!app.isLoggedIn) {
      navigate('/login');
      return;
    }

    const loadOrderWithProducts = async () => {
      if (!orderId) {
        navigate('/orders');
        return;
      }

      try {
        setLoading(true);
        
        // Try to find order in context first
        let foundOrder = app.orders.orders.find((o: Order) => o.id === orderId);
        
        // If not found, try to load from API
        if (!foundOrder) {
          // Try to load all orders for user (without status filter to get all)
          await app.orders.loadOrdersForUser();
          foundOrder = app.orders.orders.find((o: Order) => o.id === orderId);
        }

        if (!foundOrder) {
            toast.error('Không tìm thấy đơn hàng');
            navigate('/orders');
          return;
        }

        // Fetch product details for each item in the order
        const enrichedItems = await Promise.all(
          foundOrder.items.map(async (item) => {
            try {
              // Fetch product details from API
              const product = await productApi.getById(item.productId);
              
              return {
                ...item,
                name: product.name || item.name || 'Sản phẩm',
                image: product.image || product.images?.[0] || item.image || '',
                variant: product.variants ? JSON.stringify(product.variants) : item.variant,
              };
            } catch (error) {
              console.error(`Failed to fetch product ${item.productId}:`, error);
              // Return item with fallback values if product fetch fails
              return {
                ...item,
                name: item.name || 'Sản phẩm',
                image: item.image || '',
              };
            }
          })
        );

        // Update order with enriched items
        const enrichedOrder: Order = {
          ...foundOrder,
          items: enrichedItems,
        };

        setOrder(enrichedOrder);
      } catch (error: any) {
        console.error('Failed to load order:', error);
        toast.error('Không thể tải thông tin đơn hàng');
      navigate('/orders');
      } finally {
        setLoading(false);
    }
    };

    loadOrderWithProducts();
  }, [orderId, app, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Không tìm thấy đơn hàng</p>
          <Button onClick={() => navigate('/orders')}>Quay lại danh sách đơn hàng</Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.status);
  const StatusIcon = statusInfo.icon;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Đã sao chép mã đơn hàng');
  };

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

  const handleCancelOrder = () => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      if (app.handleCancelOrder) {
        app.handleCancelOrder(order.id);
        toast.success('Đã hủy đơn hàng');
        navigate('/orders');
      }
    }
  };

  const handleReview = () => {
    navigate(`/orders/${order.id}/review`);
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header with Back Button */}
      <div className="sticky top-16 z-30 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">Chi tiết đơn hàng</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Status */}
        <div className={`mb-6 rounded-xl ${statusInfo.bgColor} border-2 p-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
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
        </div>

        <div className="space-y-6">
          {/* Expires At Warning for Pending Payment */}
          {order.expiresAt && order.status === 'pending' && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
              <div className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
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
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-background border-2 shrink-0 shadow-sm">
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

        {/* Action Buttons - Enhanced */}
        <div className="mt-8 p-6 bg-muted/30 rounded-xl border flex flex-wrap items-center justify-end gap-3">
          {order.status === 'pending' && app.handleCancelOrder && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Hủy đơn hàng
            </Button>
          )}

          {order.status === 'completed' && app.handleReview && (
            <Button
              variant="default"
              onClick={handleReview}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Đánh giá
            </Button>
          )}

          {app.handleReorder && (
            <Button
              variant="outline"
              onClick={() => {
                app.handleReorder(order.id);
                navigate('/cart');
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Mua lại
            </Button>
          )}

          {app.handleContactShop && order.ownerId && (
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
        </div>
      </div>
    </div>
  );
}

