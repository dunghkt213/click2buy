/**
 * OrdersPage - Trang đơn hàng (Đã fix lỗi Implicit Any TypeScript)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';

// Import UI Components
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';

// Icons
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
  MessageSquare
} from 'lucide-react';

// Types & Utils
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

// Import Modals
import { OrderDetailModal } from '../../components/order/OrderDetailModal'; 
import { ReviewModal, ReviewData } from '../../components/review/ReviewModal';

// --- CONFIG ---
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

export function OrdersPage() {
  const navigate = useNavigate();
  const app = useAppContext(); 

  // --- 1. STATE & LOGIC ---
  const [selectedTab, setSelectedTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // --- 2. EFFECT (Load Data) ---
  useEffect(() => {
    if (!app.isLoggedIn) {
      navigate('/login');
      return;
    }
    app.orders.loadOrders();
  }, [app.isLoggedIn, app.orders, navigate]);

  const orders: Order[] = app.orders.orders || [];

  // --- 3. FILTERING (Fix lỗi 'order' implicitly any) ---
  const filteredOrders = orders.filter((order: Order) => {
    const matchesTab = selectedTab === 'all' || order.status === selectedTab;
    // Fix lỗi 'item' implicitly any bên trong some
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Count orders by status (Fix lỗi 'order' implicitly any)
  const getStatusCount = (status: TabValue) => {
    if (status === 'all') return orders.length;
    return orders.filter((order: Order) => order.status === status).length;
  };

  // --- 4. HANDLERS ---
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    if (app.handleViewOrderDetail) {
        app.handleViewOrderDetail(order);
    }
  };

  const handleReview = (orderId: string) => {
    // Fix lỗi 'order' implicitly any trong find
    setSelectedOrder(orders.find((order: Order) => order.id === orderId) || null);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (reviewData: ReviewData) => {
    if (selectedOrder) {
      app.handleReview(selectedOrder.id, reviewData);
      setIsReviewModalOpen(false);
    }
  };

  const onBack = () => {
      navigate('/feed');
  };

  // --- 5. RENDER ---
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
                <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi đơn hàng của bạn</p>
              </div>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm theo mã đơn hoặc tên SP..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as TabValue)}>
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 mb-6 overflow-x-auto">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const count = getStatusCount(tab.value);
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 data-[state=active]:bg-background min-w-fit">
                  <Icon className="w-4 h-4" /> {tab.label}
                  {count > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{count}</Badge>}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0 space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <Package className="w-24 h-24 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl mb-2">Chưa có đơn hàng</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? 'Không tìm thấy đơn hàng phù hợp'
                      : selectedTab === 'all'
                      ? 'Bạn chưa có đơn hàng nào'
                      // Fix lỗi 't' implicitly any
                      : `Bạn chưa có đơn hàng ${statusTabs.find((t: any) => t.value === selectedTab)?.label.toLowerCase()}`}
                  </p>
                  <Button onClick={() => navigate('/feed')} className="bg-primary hover:bg-primary/90">Tiếp tục mua sắm</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Fix lỗi 'order' implicitly any trong map */}
                {filteredOrders.map((order: Order) => {
                  const statusInfo = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100' };
                  
                  return (
                    <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${statusInfo.color} w-fit`}>{statusInfo.label}</Badge>
                      </div>

                      {/* Order Items */}
                      <div className="p-4 cursor-pointer" onClick={() => handleViewDetail(order)}>
                        <div className="space-y-3">
                          {/* Fix lỗi 'item' implicitly any */}
                          {order.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex gap-3">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-2 text-sm">{item.name}</p>
                                {item.variant && <p className="text-xs text-muted-foreground mt-1">{item.variant}</p>}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                                  <span className="font-semibold text-sm text-primary">{formatPrice(item.price)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground text-center py-1 bg-muted/20 rounded">+ {order.items.length - 2} sản phẩm khác</p>
                          )}
                        </div>

                        {/* Estimated Delivery */}
                        {order.estimatedDelivery && order.status === 'shipping' && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <Truck className="w-4 h-4" /> Dự kiến giao: {new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-muted/30 border-t gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                          <span className="text-xl font-bold text-primary">{formatPrice(order.finalPrice)}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {/* Removed "Hủy đơn" button for "all" tab as requested */}

                          {order.status === 'shipping' && (
                            <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleViewDetail(order); }}>Theo dõi</Button>
                          )}

                          {order.status === 'completed' && (
                            <>
                              <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReview(order.id); }} className="gap-2"><Star className="w-4 h-4" /> Đánh giá</Button>
                              <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); app.handleReorder(order.id); }}>Mua lại</Button>
                            </>
                          )}

                          {(order.status === 'cancelled' || order.status === 'refund') && (
                            <Button variant="outline" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); app.handleReorder(order.id); }}>Mua lại</Button>
                          )}

                          <Button variant="default" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleViewDetail(order); }}>Xem chi tiết</Button>
                          {order.ownerId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e: React.MouseEvent) => { 
                                e.stopPropagation();
                                e.preventDefault();
                                // Navigate directly to chat page with shop ownerId
                                navigate(`/chat?userId=${order.ownerId}`);
                              }} 
                              className="gap-2 px-2" 
                              title="Liên hệ Shop"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}
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
      {isDetailModalOpen && (
        <OrderDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
            onCancelOrder={app.handleCancelOrder}
            onReorder={app.handleReorder}
            onReview={(id) => handleReview(id)}
            onContactShop={app.handleContactShop}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            order={selectedOrder}
            onSubmitReview={handleReviewSubmit}
        />
      )}
    </div>
  );
}