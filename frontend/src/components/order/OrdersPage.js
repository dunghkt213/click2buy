import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * OrdersPage - Trang đơn hàng (Đã fix lỗi Implicit Any TypeScript)
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';
// Import UI Components
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
// Icons
import { ArrowLeft, Search, Package, Clock, Truck, CheckCircle, XCircle, RotateCcw, ShoppingBag, Star, MessageSquare } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
// Import Modals
import { OrderDetailModal } from '../../components/order/OrderDetailModal';
import { ReviewModal } from '../../components/review/ReviewModal';
const statusTabs = [
    { value: 'all', label: 'Tất cả', icon: ShoppingBag },
    { value: 'pending', label: 'Chờ xác nhận', icon: Clock },
    { value: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle },
    { value: 'shipping', label: 'Đang giao', icon: Truck },
    { value: 'completed', label: 'Hoàn thành', icon: CheckCircle },
    { value: 'cancelled', label: 'Đã hủy', icon: XCircle },
    { value: 'refund', label: 'Trả hàng', icon: RotateCcw },
];
const statusConfig = {
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
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
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
    const orders = app.orders.orders || [];
    // --- 3. FILTERING (Fix lỗi 'order' implicitly any) ---
    const filteredOrders = orders.filter((order) => {
        const matchesTab = selectedTab === 'all' || order.status === selectedTab;
        // Fix lỗi 'item' implicitly any bên trong some
        const matchesSearch = searchQuery === '' ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });
    // Count orders by status (Fix lỗi 'order' implicitly any)
    const getStatusCount = (status) => {
        if (status === 'all')
            return orders.length;
        return orders.filter((order) => order.status === status).length;
    };
    // --- 4. HANDLERS ---
    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
        if (app.handleViewOrderDetail) {
            app.handleViewOrderDetail(order);
        }
    };
    const handleReview = (orderId) => {
        // Fix lỗi 'order' implicitly any trong find
        setSelectedOrder(orders.find((order) => order.id === orderId) || null);
        setIsReviewModalOpen(true);
    };
    const handleReviewSubmit = (reviewData) => {
        if (selectedOrder) {
            app.handleReview(selectedOrder.id, reviewData);
            setIsReviewModalOpen(false);
        }
    };
    const onBack = () => {
        navigate('/feed');
    };
    // --- 5. RENDER ---
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: onBack, className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Quay l\u1EA1i"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u0110\u01A1n h\u00E0ng c\u1EE7a t\u00F4i" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Qu\u1EA3n l\u00FD v\u00E0 theo d\u00F5i \u0111\u01A1n h\u00E0ng c\u1EE7a b\u1EA1n" })] })] }), _jsxs("div", { className: "relative w-full md:w-80", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm theo m\u00E3 \u0111\u01A1n ho\u1EB7c t\u00EAn SP...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs(Tabs, { value: selectedTab, onValueChange: (value) => setSelectedTab(value), children: [_jsx(TabsList, { className: "w-full justify-start h-auto p-1 bg-muted/50 mb-6 overflow-x-auto", children: statusTabs.map((tab) => {
                                const Icon = tab.icon;
                                const count = getStatusCount(tab.value);
                                return (_jsxs(TabsTrigger, { value: tab.value, className: "flex items-center gap-2 data-[state=active]:bg-background min-w-fit", children: [_jsx(Icon, { className: "w-4 h-4" }), " ", tab.label, count > 0 && _jsx(Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5 text-xs", children: count })] }, tab.value));
                            }) }), _jsx(TabsContent, { value: selectedTab, className: "mt-0 space-y-4", children: filteredOrders.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-24 h-24 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-xl mb-2", children: "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng" }), _jsx("p", { className: "text-muted-foreground mb-6", children: searchQuery
                                                ? 'Không tìm thấy đơn hàng phù hợp'
                                                : selectedTab === 'all'
                                                    ? 'Bạn chưa có đơn hàng nào'
                                                    // Fix lỗi 't' implicitly any
                                                    : `Bạn chưa có đơn hàng ${statusTabs.find((t) => t.value === selectedTab)?.label.toLowerCase()}` }), _jsx(Button, { onClick: () => navigate('/feed'), className: "bg-primary hover:bg-primary/90", children: "Ti\u1EBFp t\u1EE5c mua s\u1EAFm" })] }) })) : (_jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => {
                                    const statusInfo = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100' };
                                    return (_jsxs(Card, { className: "overflow-hidden hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border-b gap-3", children: [_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Package, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "font-mono text-sm font-medium", children: order.orderNumber })] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["\u0110\u1EB7t ng\u00E0y ", new Date(order.createdAt).toLocaleDateString('vi-VN')] })] }) }), _jsx(Badge, { variant: "outline", className: `${statusInfo.color} w-fit`, children: statusInfo.label })] }), _jsxs("div", { className: "p-4 cursor-pointer", onClick: () => handleViewDetail(order), children: [_jsxs("div", { className: "space-y-3", children: [order.items.slice(0, 2).map((item) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium line-clamp-2 text-sm", children: item.name }), item.variant && _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: item.variant }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["x", item.quantity] }), _jsx("span", { className: "font-semibold text-sm text-primary", children: formatPrice(item.price) })] })] })] }, item.id))), order.items.length > 2 && (_jsxs("p", { className: "text-sm text-muted-foreground text-center py-1 bg-muted/20 rounded", children: ["+ ", order.items.length - 2, " s\u1EA3n ph\u1EA9m kh\u00E1c"] }))] }), order.estimatedDelivery && order.status === 'shipping' && (_jsx("div", { className: "mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2", children: [_jsx(Truck, { className: "w-4 h-4" }), " D\u1EF1 ki\u1EBFn giao: ", new Date(order.estimatedDelivery).toLocaleDateString('vi-VN')] }) }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-muted/30 border-t gap-4", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("span", { className: "text-xl font-bold text-primary", children: formatPrice(order.finalPrice) })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto justify-end", children: [order.status === 'shipping' && (_jsx(Button, { variant: "outline", size: "sm", onClick: (e) => { e.stopPropagation(); handleViewDetail(order); }, children: "Theo d\u00F5i" })), order.status === 'completed' && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: (e) => { e.stopPropagation(); handleReview(order.id); }, className: "gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), " \u0110\u00E1nh gi\u00E1"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: (e) => { e.stopPropagation(); app.handleReorder(order.id); }, children: "Mua l\u1EA1i" })] })), (order.status === 'cancelled' || order.status === 'refund') && (_jsx(Button, { variant: "outline", size: "sm", onClick: (e) => { e.stopPropagation(); app.handleReorder(order.id); }, children: "Mua l\u1EA1i" })), _jsx(Button, { variant: "default", size: "sm", onClick: (e) => { e.stopPropagation(); handleViewDetail(order); }, children: "Xem chi ti\u1EBFt" }), order.ownerId && (_jsx(Button, { variant: "ghost", size: "sm", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    // Navigate directly to chat page with shop ownerId
                                                                    navigate(`/chat?userId=${order.ownerId}`);
                                                                }, className: "gap-2 px-2", title: "Li\u00EAn h\u1EC7 Shop", children: _jsx(MessageSquare, { className: "w-4 h-4" }) }))] })] })] }, order.id));
                                }) })) })] }) }), isDetailModalOpen && (_jsx(OrderDetailModal, { isOpen: isDetailModalOpen, onClose: () => setIsDetailModalOpen(false), order: selectedOrder, onCancelOrder: app.handleCancelOrder, onReorder: app.handleReorder, onReview: (id) => handleReview(id), onContactShop: app.handleContactShop })), isReviewModalOpen && (_jsx(ReviewModal, { isOpen: isReviewModalOpen, onClose: () => setIsReviewModalOpen(false), order: selectedOrder, onSubmitReview: handleReviewSubmit }))] }));
}
