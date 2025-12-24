import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * OrdersPage - Trang đơn hàng (Đã fix lỗi Implicit Any TypeScript)
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../providers/AppProvider";
// Import UI Components
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "../../components/ui/tabs";
// Icons
import { ArrowLeft, CheckCircle, Clock, MessageSquare, Package, Search, Star, Truck, XCircle, } from "lucide-react";
// Types & Utils
import { toast } from "sonner";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { formatPrice } from "../../utils/utils";
import { refreshAccessToken } from "../../apis/client/apiClient";
const statusTabs = [
    { value: "pending", label: "Đang chờ thanh toán", icon: Clock },
    { value: "confirmed", label: "Chờ xác nhận", icon: CheckCircle },
    { value: "shipping", label: "Đang giao", icon: Truck },
    { value: "completed", label: "Hoàn thành", icon: CheckCircle },
    { value: "cancelled", label: "Đã hủy", icon: XCircle },
];
const statusConfig = {
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
    const [selectedTab, setSelectedTab] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [allOrders, setAllOrders] = useState([]); // Store all orders for counting
    // ReviewModal removed - now using ReviewPage
    // Map frontend status to backend status
    const mapStatusToBackend = (status) => {
        const statusMap = {
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
    // --- 2. EFFECT (Auto Refresh Token) ---
    useEffect(() => {
        if (!app.isLoggedIn)
            return;
        // Auto refresh token when entering OrdersPage (similar to login flow)
        const autoRefreshToken = async () => {
            try {
                // Refresh token proactively to ensure valid token before API calls
                const newToken = await refreshAccessToken();
                if (newToken) {
                    console.log('✅ [OrdersPage] Token refreshed successfully');
                }
                else {
                    console.warn('⚠️ [OrdersPage] Token refresh failed, user may need to login again');
                    // Don't show error to user, let normal flow handle it
                    // If token is invalid, subsequent API calls will handle 401 errors
                }
            }
            catch (error) {
                console.warn('⚠️ [OrdersPage] Auto refresh token failed:', error);
                // Don't show error to user, let normal flow handle it
                // If token is invalid, subsequent API calls will handle 401 errors via apiClient
            }
        };
        autoRefreshToken();
    }, [app.isLoggedIn]);
    // --- 3. EFFECT (Load All Orders for Counting) ---
    useEffect(() => {
        if (!app.isLoggedIn) {
            navigate("/login");
            return;
        }
        // Load all orders (without status filter) to count for all tabs
        const loadAllOrdersForCounting = async () => {
            try {
                // Refresh token trước khi load orders để tránh 401 errors
                try {
                    await refreshAccessToken();
                }
                catch (error) {
                    console.warn('⚠️ [OrdersPage] Token refresh failed before loading all orders:', error);
                    // Continue anyway, apiClient will handle 401 errors
                }
                // Import orderService to load directly without affecting context
                const { orderService } = await import('../../apis/order');
                const { mapOrderResponse } = await import('../../apis/order/order.mapper');
                // Load all orders without status filter
                const response = await orderService.getAllForUser();
                // Handle different response formats
                let allOrdersData = [];
                if (Array.isArray(response)) {
                    allOrdersData = response;
                }
                else if (response && typeof response === 'object') {
                    // Check if it's an error object (has status, message, name)
                    if (response.status && response.message && response.name) {
                        // This is an error object, not a success response
                        throw new Error(response.message || 'Failed to load orders');
                    }
                    // Try common response formats
                    if (Array.isArray(response.data)) {
                        allOrdersData = response.data;
                    }
                    else if (Array.isArray(response.orders)) {
                        allOrdersData = response.orders;
                    }
                    else if (Array.isArray(response.result)) {
                        allOrdersData = response.result;
                    }
                    else {
                        // If no array found, it might be empty or unexpected format
                        console.warn('Unexpected response format, treating as empty:', response);
                        allOrdersData = [];
                    }
                }
                const mappedOrders = allOrdersData.map(mapOrderResponse);
                setAllOrders(mappedOrders);
            }
            catch (error) {
                // Don't log error for authentication issues (user might not be logged in)
                if (error?.status === 401 || error?.status === 403) {
                    console.warn('Authentication error when loading orders for counting:', error?.message);
                }
                else {
                    console.error('Failed to load orders for counting:', error);
                }
                setAllOrders([]); // Set empty array on error
            }
        };
        loadAllOrdersForCounting();
    }, [app.isLoggedIn, navigate]); // Only run once on mount
    // --- 4. EFFECT (Load Orders for Selected Tab) ---
    useEffect(() => {
        if (!app.isLoggedIn) {
            return;
        }
        // Refresh token trước khi load orders để tránh 401 errors
        const loadOrdersWithRefresh = async () => {
            try {
                await refreshAccessToken();
            }
            catch (error) {
                console.warn('⚠️ [OrdersPage] Token refresh failed before loading orders:', error);
                // Continue anyway, apiClient will handle 401 errors
            }
            // Load orders for user with current tab status
            const backendStatus = mapStatusToBackend(selectedTab);
            app.orders.loadOrdersForUser(backendStatus);
        };
        loadOrdersWithRefresh();
    }, [selectedTab, app.isLoggedIn]); // Load when tab changes
    // Lấy đơn hàng thật từ Context (filtered by selected tab)
    const orders = app.orders.orders || [];
    // --- 3. FILTERING (Fix lỗi 'order' implicitly any) ---
    const filteredOrders = orders.filter((order) => {
        const matchesTab = order.status === selectedTab;
        // Fix lỗi 'item' implicitly any bên trong some
        const matchesSearch = searchQuery === "" ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });
    // Count orders by status from allOrders (to show count for all tabs)
    const getStatusCount = (status) => {
        return allOrders.filter((order) => order.status === status).length;
    };
    // --- 4. HANDLERS ---
    const handleViewDetail = (order) => {
        navigate(`/orders/${order.id}`);
    };
    const handleReview = (orderId) => {
        // Navigate to review page instead of opening modal
        navigate(`/review/${orderId}`);
    };
    const handleCancelOrder = async (orderId, orderStatus) => {
        try {
            // Refresh token trước khi thao tác để tránh 401 errors
            try {
                await refreshAccessToken();
            }
            catch (error) {
                console.warn('⚠️ [OrdersPage] Token refresh failed before cancel order:', error);
                // Continue anyway, apiClient will handle 401 errors
            }
            const { orderService } = await import('../../apis/order');
            const { mapOrderResponse } = await import('../../apis/order/order.mapper');
            // Nếu order status là "pending" (Đang chờ thanh toán), dùng cancel_order
            // Nếu order status là "confirmed" (Chờ xác nhận), dùng cancel_request
            if (orderStatus === 'pending') {
                await orderService.cancelOrder(orderId);
                toast.success('Đã hủy đơn hàng thành công');
            }
            else {
                await orderService.cancelRequest(orderId);
                toast.success('Đã gửi yêu cầu hủy đơn hàng thành công');
            }
            // Cập nhật UI: xóa order khỏi danh sách hoặc cập nhật status
            app.orders.setOrders((prev) => prev.filter((order) => order.id !== orderId));
            // Cập nhật allOrders để cập nhật số lượng badge
            setAllOrders((prev) => prev.filter((order) => order.id !== orderId));
            // Reload orders để cập nhật danh sách
            const backendStatus = mapStatusToBackend(selectedTab);
            await app.orders.loadOrdersForUser(backendStatus);
            // Reload all orders để cập nhật badge
            const allOrdersData = await orderService.getAllForUser();
            const mappedOrders = allOrdersData.map(mapOrderResponse);
            setAllOrders(mappedOrders);
        }
        catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error(error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
        }
    };
    const handleMarkAsReceived = async (orderId) => {
        try {
            // Refresh token trước khi thao tác để tránh 401 errors
            try {
                await refreshAccessToken();
            }
            catch (error) {
                console.warn('⚠️ [OrdersPage] Token refresh failed before mark as received:', error);
                // Continue anyway, apiClient will handle 401 errors
            }
            const { orderService } = await import('../../apis/order');
            const { mapOrderResponse } = await import('../../apis/order/order.mapper');
            // Gọi API để xác nhận đã nhận hàng
            await orderService.markAsReceived(orderId);
            toast.success('Đã xác nhận nhận hàng thành công');
            // Reload orders để cập nhật danh sách
            const backendStatus = mapStatusToBackend(selectedTab);
            await app.orders.loadOrdersForUser(backendStatus);
            // Reload all orders để cập nhật badge
            const allOrdersData = await orderService.getAllForUser();
            const mappedOrders = allOrdersData.map(mapOrderResponse);
            setAllOrders(mappedOrders);
        }
        catch (error) {
            console.error('Failed to mark order as received:', error);
            toast.error(error.message || 'Không thể xác nhận nhận hàng. Vui lòng thử lại.');
        }
    };
    // handleReviewSubmit removed - now using ReviewPage
    const onBack = () => {
        navigate("/feed");
    };
    // --- 5. RENDER ---
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: onBack, className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Quay l\u1EA1i"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u0110\u01A1n h\u00E0ng c\u1EE7a t\u00F4i" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Qu\u1EA3n l\u00FD v\u00E0 theo d\u00F5i \u0111\u01A1n h\u00E0ng c\u1EE7a b\u1EA1n" })] })] }), _jsxs("div", { className: "relative w-full md:w-80", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm theo m\u00E3 \u0111\u01A1n ho\u1EB7c t\u00EAn SP...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs(Tabs, { value: selectedTab, onValueChange: (value) => setSelectedTab(value), children: [_jsx(TabsList, { className: "w-full justify-start h-auto p-1 bg-muted/50 mb-6 overflow-x-auto", children: statusTabs.map((tab) => {
                                const Icon = tab.icon;
                                const count = getStatusCount(tab.value);
                                return (_jsxs(TabsTrigger, { value: tab.value, className: "flex items-center gap-2 data-[state=active]:bg-background min-w-fit", children: [_jsx(Icon, { className: "w-4 h-4" }), " ", tab.label, count > 0 && (_jsx(Badge, { className: "ml-1 h-5 px-1.5 text-xs bg-red-500 text-white border-0", children: count }))] }, tab.value));
                            }) }), _jsx(TabsContent, { value: selectedTab, className: "mt-0 space-y-4", children: filteredOrders.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-24 h-24 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-xl mb-2", children: "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng" }), _jsx("p", { className: "text-muted-foreground mb-6", children: searchQuery
                                                ? "Không tìm thấy đơn hàng phù hợp"
                                                : // Fix lỗi 't' implicitly any
                                                    `Bạn chưa có đơn hàng ${statusTabs
                                                        .find((t) => t.value === selectedTab)
                                                        ?.label.toLowerCase()}` }), _jsx(Button, { onClick: () => navigate("/feed"), className: "bg-primary hover:bg-primary/90", children: "Ti\u1EBFp t\u1EE5c mua s\u1EAFm" })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => {
                                    const statusInfo = statusConfig[order.status] || {
                                        label: order.status,
                                        color: "bg-gray-100",
                                    };
                                    return (_jsxs(Card, { className: "overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Package, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "font-mono text-sm font-medium", children: order.orderNumber })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\u0110\u1EB7t ng\u00E0y", " ", new Date(order.createdAt).toLocaleDateString("vi-VN")] })] }) }), order.status !== "confirmed" && order.status !== "pending" && (_jsx(Badge, { variant: "outline", className: `${statusInfo.color} w-fit`, children: statusInfo.label }))] }), _jsxs("div", { className: "p-4 cursor-pointer", onClick: () => handleViewDetail(order), children: [_jsxs("div", { className: "space-y-3", children: [order.items.slice(0, 2).map((item) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium line-clamp-2 text-sm", children: item.name }), item.variant && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: item.variant })), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["x", item.quantity] }), _jsx("span", { className: "font-semibold text-sm text-primary", children: formatPrice(item.price) })] })] })] }, item.id))), order.items.length > 2 && (_jsxs("p", { className: "text-sm text-muted-foreground text-center py-1 bg-muted/20 rounded", children: ["+ ", order.items.length - 2, " s\u1EA3n ph\u1EA9m kh\u00E1c"] }))] }), order.expiresAt && order.status === "pending" && (_jsx("div", { className: "mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800", children: _jsxs("p", { className: "text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), " H\u1EBFt h\u1EA1n thanh to\u00E1n:", " ", new Date(order.expiresAt).toLocaleString("vi-VN", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })] }) })), order.estimatedDelivery &&
                                                        order.status === "shipping" && (_jsx("div", { className: "mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), " D\u1EF1 ki\u1EBFn giao:", " ", new Date(order.estimatedDelivery).toLocaleDateString("vi-VN")] }) })), _jsxs("div", { className: "mt-4 pt-4 border-t space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "T\u1EA1m t\u00EDnh:" }), _jsx("span", { children: formatPrice(order.totalPrice) })] }), order.shippingFee > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Ph\u00ED v\u1EADn chuy\u1EC3n:" }), _jsx("span", { children: formatPrice(order.shippingFee) })] })), order.voucherDiscount && order.voucherDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600 dark:text-green-400", children: [_jsx("span", { children: "Gi\u1EA3m gi\u00E1 voucher:" }), _jsxs("span", { children: ["-", formatPrice(order.voucherDiscount)] })] })), order.paymentDiscount && order.paymentDiscount > 0 && (_jsxs("div", { className: "flex justify-between text-sm text-green-600 dark:text-green-400", children: [_jsx("span", { children: "Gi\u1EA3m gi\u00E1 thanh to\u00E1n:" }), _jsxs("span", { children: ["-", formatPrice(order.paymentDiscount)] })] }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-muted/30 border-t gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-baseline gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("span", { className: "text-xl font-bold text-primary", children: formatPrice(order.finalPrice) })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto justify-end", children: [order.status === "pending" && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "default", size: "sm", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            // Navigate to payment process page
                                                                            navigate(`/payment/process/${order.orderNumber}`, {
                                                                                state: {
                                                                                    orderCode: order.orderNumber,
                                                                                    totalAmount: order.finalPrice,
                                                                                }
                                                                            });
                                                                        }, children: "Ti\u1EBFp t\u1EE5c thanh to\u00E1n" }), _jsx(Button, { variant: "outline", size: "sm", 
                                                                        // Fix lỗi 'e' implicitly any
                                                                        onClick: async (e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
                                                                                await handleCancelOrder(order.id, order.status);
                                                                            }
                                                                        }, className: "text-red-600 hover:text-red-700 hover:bg-red-50", children: "H\u1EE7y \u0111\u01A1n" })] })), order.status === "shipping" && (_jsx(Button, { variant: "default", size: "sm", onClick: async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm("Bạn đã nhận được hàng?")) {
                                                                        await handleMarkAsReceived(order.id);
                                                                    }
                                                                }, children: "\u0110\u00E3 nh\u1EADn" })), order.status === "completed" && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            handleReview(order.id);
                                                                        }, className: "gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), " \u0110\u00E1nh gi\u00E1"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            app.handleReorder(order.id);
                                                                        }, children: "Mua l\u1EA1i" })] })), (order.status === "cancelled" ||
                                                                order.status === "refund") && (_jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    app.handleReorder(order.id);
                                                                }, children: "Mua l\u1EA1i" })), order.status === "confirmed" && (_jsx(Button, { variant: "outline", size: "sm", onClick: async (e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
                                                                        await handleCancelOrder(order.id, order.status);
                                                                    }
                                                                }, className: "text-red-600 hover:text-red-700 hover:bg-red-50", children: "H\u1EE7y \u0111\u01A1n h\u00E0ng" })), _jsx(Button, { variant: "default", size: "sm", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDetail(order);
                                                                }, children: "Xem chi ti\u1EBFt" }), order.ownerId && (_jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    // Navigate directly to chat page with shop ownerId
                                                                    navigate(`/chat?userId=${order.ownerId}`);
                                                                }, className: "gap-2 px-2", title: "Li\u00EAn h\u1EC7 Shop", children: _jsx(MessageSquare, { className: "w-4 h-4" }) }))] })] })] }, order.id));
                                }) })) })] }) })] }));
}
