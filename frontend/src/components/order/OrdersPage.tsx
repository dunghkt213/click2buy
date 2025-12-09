import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import {
  ArrowLeft,
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Star,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus } from '../../types'; // Kiểm tra lại đường dẫn types nếu cần
import { formatPrice } from '../../utils/utils'; // Kiểm tra lại đường dẫn utils nếu cần
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { OrderDetailModal } from './OrderDetailModal';
// Import ReviewModal và ReviewData
import { ReviewModal, ReviewData } from '../review/ReviewModal';

interface OrdersPageProps {
  orders: Order[];
  onBack: () => void;
  onViewDetail: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onReorder: (orderId: string) => void;
  // Cập nhật onReview để nhận thêm data
  onReview: (orderId: string, reviewData: ReviewData) => void; 
  onContactShop: (orderId: string) => void;
  defaultTab?: TabValue;
}

// Thay đổi logic Waiting Payment -> All để tránh lỗi Type như trong hình
type TabValue = 'all' | OrderStatus;

const statusTabs = [
  { value: 'all' as TabValue, label: 'Tất cả', icon: ShoppingBag },
  { value: 'pending' as TabValue, label: 'Chờ xác nhận', icon: Clock },
  { value: 'confirmed' as TabValue, label: 'Đã xác nhận', icon: CheckCircle },
  { value: 'shipping' as TabValue, label: 'Đang giao', icon: Truck },
  { value: 'completed' as TabValue, label: 'Hoàn thành', icon: CheckCircle },
  { value: 'cancelled' as TabValue, label: 'Đã hủy', icon: XCircle },
  { value: 'refund' as TabValue, label: 'Trả hàng', icon: RotateCcw },
];

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  shipping: { label: 'Đang giao hàng', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  completed: { label: 'Hoàn thành', color: 'bg-green-500/10 text-green-700 border-green-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-500/10 text-red-700 border-red-200' },
  refund: { label: 'Hoàn tiền', color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
};

// Helper safe config
const defaultStatusConfig = { label: 'Không xác định', color: 'bg-gray-500/10 text-gray-700 border-gray-200' };
const getStatusConfig = (status: string | undefined): { label: string; color: string } => {
  if (!status || !(status in statusConfig)) {
    return defaultStatusConfig;
  }
  return statusConfig[status as OrderStatus];
};

export function OrdersPage({
  orders,
  onBack,
  onViewDetail,
  onCancelOrder,
  onReorder,
  onReview,
  onContactShop,
  defaultTab = 'all'
}: OrdersPageProps) {
  const [selectedTab, setSelectedTab] = useState<TabValue>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // State quản lý Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesTab = selectedTab === 'all' || order.status === selectedTab;
    
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Count orders by status
  const getStatusCount = (status: TabValue) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    onViewDetail(order);
  };

  // --- REVIEW HANDLERS ---
  const handleReview = (orderId: string) => {
    const orderToReview = orders.find(order => order.id === orderId) || null;
    setSelectedOrder(orderToReview);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (reviewData: ReviewData) => {
    if (selectedOrder) {
      onReview(selectedOrder.id, reviewData);
      // Modal sẽ tự đóng hoặc được đóng bởi props isOpen
      setIsReviewModalOpen(false); 
    }
  };
  // -----------------------

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
              <div>
                <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Quản lý và theo dõi đơn hàng của bạn
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as TabValue)}>
          {/* Tabs List */}
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 mb-6 overflow-x-auto">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const count = getStatusCount(tab.value);
              
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-background"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Orders List */}
          <TabsContent value={selectedTab} className="mt-0">
            {filteredOrders.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Package className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl mb-2">Chưa có đơn hàng</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? 'Không tìm thấy đơn hàng phù hợp'
                      : `Bạn chưa có đơn hàng ${statusTabs.find(t => t.value === selectedTab)?.label.toLowerCase()}`}
                  </p>
                  <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusConfig(order.status);
                  
                  return (
                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{order.orderNumber}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex gap-3">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                                    {item.variant}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                                  <span className="font-semibold text-primary">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              + {order.items.length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>

                        {/* Estimated Delivery */}
                        {order.estimatedDelivery && order.status === 'shipping' && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Dự kiến giao: {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-t">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(order.finalPrice)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onCancelOrder(order.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Hủy đơn
                            </Button>
                          )}

                          {order.status === 'shipping' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              Theo dõi
                            </Button>
                          )}

                          {order.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                // ĐÃ SỬA: Gọi handleReview thay vì onReview trực tiếp
                                onClick={() => handleReview(order.id)}
                                className="gap-2"
                              >
                                <Star className="w-4 h-4" />
                                Đánh giá
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReorder(order.id)}
                              >
                                Mua lại
                              </Button>
                            </>
                          )}

                          {(order.status === 'cancelled' || order.status === 'refund') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onReorder(order.id)}
                            >
                              Mua lại
                            </Button>
                          )}

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleViewDetail(order)}
                          >
                            Xem chi tiết
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onContactShop(order.id)}
                            className="gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Liên hệ
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onCancelOrder={onCancelOrder}
        onReorder={onReorder}
       onReview={handleReview} 
        // --------------------
        
        onContactShop={onContactShop}
      />

      {/* Review Modal - MỚI ĐƯỢC THÊM */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={selectedOrder}
        onSubmitReview={handleReviewSubmit}
      />
    </div>
  );
}