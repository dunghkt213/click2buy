/**
 * OrdersPage - Trang đơn hàng (Đã fix lỗi Implicit Any TypeScript)
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../providers/AppProvider";

// Import UI Components
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";

// Icons
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    MessageSquare,
    Package,
    Search,
    Star,
    Truck,
    XCircle,
} from "lucide-react";

// Types & Utils
import { toast } from "sonner";
import { orderService } from "../../apis/order";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Order, OrderStatus } from "../../types";
import { formatPrice } from "../../utils/utils";

// Import Modals
import { ReviewData, ReviewModal } from "../../components/review/ReviewModal";

// --- CONFIG ---
type TabValue = OrderStatus;

const statusTabs = [
  { value: "pending" as TabValue, label: "Đang chờ thanh toán", icon: Clock },
  { value: "confirmed" as TabValue, label: "Chờ xác nhận", icon: CheckCircle },
  { value: "shipping" as TabValue, label: "Đang giao", icon: Truck },
  { value: "completed" as TabValue, label: "Hoàn thành", icon: CheckCircle },
  { value: "cancelled" as TabValue, label: "Đã hủy", icon: XCircle },
];

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: {
    label: "Đang chờ thanh toán",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  shipping: {
    label: "Đang giao hàng",
    color: "bg-purple-500/10 text-purple-700 border-purple-200",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-500/10 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-500/10 text-red-700 border-red-200",
  },
  refund: {
    label: "Hoàn tiền",
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
  cancel_request: {
    label: "Yêu cầu hủy",
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
  },
};

export function OrdersPage() {
  const navigate = useNavigate();
  const app = useAppContext();

  // --- 1. STATE & LOGIC ---
  const [selectedTab, setSelectedTab] = useState<TabValue>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Store all orders for counting

  // Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Map frontend status to backend status
  const mapStatusToBackend = (status: TabValue): string | undefined => {
    const statusMap: Record<TabValue, string | undefined> = {
      pending: 'PENDING_PAYMENT',
      confirmed: 'PENDING_ACCEPT',
      shipping: 'CONFIRMED', // "Đang giao" → CONFIRMED
      completed: 'DELIVERED', // "Hoàn thành" → DELIVERED
      cancelled: 'CANCELLED', // "Đã hủy" → CANCELLED
      refund: undefined, // Handle separately if needed
      cancel_request: 'REQUESTED_CANCEL', // "Yêu cầu hủy" → REQUESTED_CANCEL
    };
    return statusMap[status];
  };

  // --- 2. EFFECT (Load All Orders for Counting) ---
  useEffect(() => {
    if (!app.isLoggedIn) {
      navigate("/login");
      return;
    }
    
    // Load all orders (without status filter) to count for all tabs
    const loadAllOrdersForCounting = async () => {
      try {
        // Import orderService to load directly without affecting context
        const { orderService } = await import('../../apis/order');
        const { mapOrderResponse } = await import('../../apis/order/order.mapper');
        
        // Load all orders without status filter
        const allOrdersData = await orderService.getAllForUser();
        const mappedOrders = allOrdersData.map(mapOrderResponse);
        setAllOrders(mappedOrders);
      } catch (error) {
        console.error('Failed to load orders for counting:', error);
      }
    };

    loadAllOrdersForCounting();
  }, [app.isLoggedIn, navigate]); // Only run once on mount

  // --- 3. EFFECT (Load Orders for Selected Tab) ---
  useEffect(() => {
    if (!app.isLoggedIn) {
      return;
    }
    // Load orders for user with current tab status
    const backendStatus = mapStatusToBackend(selectedTab);
    app.orders.loadOrdersForUser(backendStatus);
  }, [selectedTab]); // Load when tab changes

  // Lấy đơn hàng thật từ Context (filtered by selected tab)
  const orders: Order[] = app.orders.orders || [];

  // --- 3. FILTERING (Fix lỗi 'order' implicitly any) ---
  const filteredOrders = orders.filter((order: Order) => {
    const matchesTab = order.status === selectedTab;
    // Fix lỗi 'item' implicitly any bên trong some
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesTab && matchesSearch;
  });

  // Count orders by status from allOrders (to show count for all tabs)
  const getStatusCount = (status: TabValue) => {
    return allOrders.filter((order: Order) => order.status === status).length;
  };

  // --- 4. HANDLERS ---
  const handleViewDetail = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleReview = (orderId: string) => {
    // Fix lỗi 'order' implicitly any trong find
    setSelectedOrder(
      orders.find((order: Order) => order.id === orderId) || null
    );
    setIsReviewModalOpen(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      // Gọi API để hủy đơn hàng
      await orderService.cancelRequest(orderId);
      
      // Cập nhật UI: xóa order khỏi danh sách hoặc cập nhật status
      app.orders.setOrders((prev: Order[]) => 
        prev.filter((order: Order) => order.id !== orderId)
      );
      
      // Cập nhật allOrders để cập nhật số lượng badge
      setAllOrders((prev: Order[]) => 
        prev.filter((order: Order) => order.id !== orderId)
      );
      
      toast.success('Đã gửi yêu cầu hủy đơn hàng thành công');
      
      // Reload orders để cập nhật danh sách
      const backendStatus = mapStatusToBackend(selectedTab);
      await app.orders.loadOrdersForUser(backendStatus);
      
      // Reload all orders để cập nhật badge
      const allOrdersData = await orderService.getAllForUser();
      const { mapOrderResponse } = await import('../../apis/order/order.mapper');
      const mappedOrders = allOrdersData.map(mapOrderResponse);
      setAllOrders(mappedOrders);
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
    }
  };

  const handleReviewSubmit = (reviewData: ReviewData) => {
    if (selectedOrder) {
      app.handleReview(selectedOrder.id, reviewData);
      setIsReviewModalOpen(false);
    }
  };

  const onBack = () => {
    navigate("/feed");
  };

  // --- 5. RENDER ---
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Quản lý và theo dõi đơn hàng của bạn
                </p>
              </div>
            </div>
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn hoặc tên SP..."
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
        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value as TabValue)}
        >
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 mb-6 overflow-x-auto">
            {statusTabs.map((tab) => {
              const Icon = tab.icon;
              const count = getStatusCount(tab.value);
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 data-[state=active]:bg-background min-w-fit"
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                  {count > 0 && (
                    <Badge
                      className="ml-1 h-5 px-1.5 text-xs bg-red-500 text-white border-0"
                    >
                      {count}
                    </Badge>
                  )}
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
                      ? "Không tìm thấy đơn hàng phù hợp"
                      : // Fix lỗi 't' implicitly any
                        `Bạn chưa có đơn hàng ${statusTabs
                          .find((t: any) => t.value === selectedTab)
                          ?.label.toLowerCase()}`}
                  </p>
                  <Button
                    onClick={() => navigate("/feed")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Fix lỗi 'order' implicitly any trong map */}
                {filteredOrders.map((order: Order) => {
                  const statusInfo = statusConfig[order.status] || {
                    label: order.status,
                    color: "bg-gray-100",
                  };

                  return (
                    <Card
                      key={order.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">
                                {order.orderNumber}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Đặt ngày{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                        {order.status !== "confirmed" && order.status !== "pending" && (
                          <Badge
                            variant="outline"
                            className={`${statusInfo.color} w-fit`}
                          >
                            {statusInfo.label}
                          </Badge>
                        )}
                      </div>

                      {/* Order Items */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => handleViewDetail(order)}
                      >
                        <div className="space-y-3">
                          {/* Fix lỗi 'item' implicitly any */}
                          {order.items.slice(0, 2).map((item: any) => (
                            <div key={item.id} className="flex gap-3">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium line-clamp-2 text-sm">
                                  {item.name}
                                </p>
                                {item.variant && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.variant}
                                  </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm text-muted-foreground">
                                    x{item.quantity}
                                  </span>
                                  <span className="font-semibold text-sm text-primary">
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground text-center py-1 bg-muted/20 rounded">
                              + {order.items.length - 2} sản phẩm khác
                            </p>
                          )}
                        </div>

                        {/* Expires At Warning for Pending Payment */}
                        {order.expiresAt && order.status === "pending" && (
                          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                              <Clock className="w-4 h-4" /> Hết hạn thanh toán:{" "}
                              {new Date(order.expiresAt).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        )}

                        {/* Estimated Delivery */}
                        {order.estimatedDelivery &&
                          order.status === "shipping" && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Dự kiến giao:{" "}
                                {new Date(
                                  order.estimatedDelivery
                                ).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          )}

                        {/* Order Summary */}
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tạm tính:</span>
                            <span>{formatPrice(order.totalPrice)}</span>
                          </div>
                          {order.shippingFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Phí vận chuyển:</span>
                              <span>{formatPrice(order.shippingFee)}</span>
                            </div>
                          )}
                          {order.voucherDiscount && order.voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                              <span>Giảm giá voucher:</span>
                              <span>-{formatPrice(order.voucherDiscount)}</span>
                            </div>
                          )}
                          {order.paymentDiscount && order.paymentDiscount > 0 && (
                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                              <span>Giảm giá thanh toán:</span>
                              <span>-{formatPrice(order.paymentDiscount)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-muted/30 border-t gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">
                            Tổng tiền:
                          </span>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(order.finalPrice)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {order.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              // Fix lỗi 'e' implicitly any
                              onClick={async (e: React.MouseEvent) => {
                                e.stopPropagation();
                                if (
                                  confirm("Bạn có chắc muốn hủy đơn hàng này?")
                                ) {
                                  await handleCancelOrder(order.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Hủy đơn
                            </Button>
                          )}

                          {order.status === "shipping" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleViewDetail(order);
                              }}
                            >
                              Theo dõi
                            </Button>
                          )}

                          {order.status === "completed" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleReview(order.id);
                                }}
                                className="gap-2"
                              >
                                <Star className="w-4 h-4" /> Đánh giá
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  app.handleReorder(order.id);
                                }}
                              >
                                Mua lại
                              </Button>
                            </>
                          )}

                          {(order.status === "cancelled" ||
                            order.status === "refund") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                app.handleReorder(order.id);
                              }}
                            >
                              Mua lại
                            </Button>
                          )}

                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleViewDetail(order);
                            }}
                          >
                            Xem chi tiết
                          </Button>
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
