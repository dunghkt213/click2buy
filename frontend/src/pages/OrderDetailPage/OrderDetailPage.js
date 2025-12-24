import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { AlertCircle, ArrowLeft, Calendar, Check, CheckCircle, Clock, Copy, CreditCard, MapPin, MessageSquare, Package, Phone, Receipt, RotateCcw, Star, TrendingDown, Truck, Wallet, XCircle } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAppContext } from '../../providers/AppProvider';
import { toast } from 'sonner';
import { productApi } from '../../apis/product/productApi';
const statusConfig = {
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
const getStatusConfig = (status) => {
    if (!status || !(status in statusConfig)) {
        return defaultStatusConfig;
    }
    return statusConfig[status];
};
export function OrderDetailPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const app = useAppContext();
    const [copied, setCopied] = useState(false);
    const [order, setOrder] = useState(null);
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
                let foundOrder = app.orders.orders.find((o) => o.id === orderId);
                // If not found, try to load from API
                if (!foundOrder) {
                    // Try to load all orders for user (without status filter to get all)
                    await app.orders.loadOrdersForUser();
                    foundOrder = app.orders.orders.find((o) => o.id === orderId);
                }
                if (!foundOrder) {
                    toast.error('Không tìm thấy đơn hàng');
                    navigate('/orders');
                    return;
                }
                // Fetch product details for each item in the order
                const enrichedItems = await Promise.all(foundOrder.items.map(async (item) => {
                    try {
                        // Fetch product details from API
                        const product = await productApi.getById(item.productId);
                        return {
                            ...item,
                            name: product.name || item.name || 'Sản phẩm',
                            image: product.image || product.images?.[0] || item.image || '',
                            variant: product.variants ? JSON.stringify(product.variants) : item.variant,
                        };
                    }
                    catch (error) {
                        console.error(`Failed to fetch product ${item.productId}:`, error);
                        // Return item with fallback values if product fetch fails
                        return {
                            ...item,
                            name: item.name || 'Sản phẩm',
                            image: item.image || '',
                        };
                    }
                }));
                // Update order with enriched items
                const enrichedOrder = {
                    ...foundOrder,
                    items: enrichedItems,
                };
                setOrder(enrichedOrder);
            }
            catch (error) {
                console.error('Failed to load order:', error);
                toast.error('Không thể tải thông tin đơn hàng');
                navigate('/orders');
            }
            finally {
                setLoading(false);
            }
        };
        loadOrderWithProducts();
    }, [orderId, app, navigate]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i th\u00F4ng tin \u0111\u01A1n h\u00E0ng..." })] }) }));
    }
    if (!order) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Kh\u00F4ng t\u00ECm th\u1EA5y \u0111\u01A1n h\u00E0ng" }), _jsx(Button, { onClick: () => navigate('/orders'), children: "Quay l\u1EA1i danh s\u00E1ch \u0111\u01A1n h\u00E0ng" })] }) }));
    }
    const statusInfo = getStatusConfig(order.status);
    const StatusIcon = statusInfo.icon;
    const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Đã sao chép mã đơn hàng');
    };
    const getPaymentMethodLabel = (method) => {
        const methods = {
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
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border shadow-sm", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate('/orders'), className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Quay l\u1EA1i"] }), _jsx(Separator, { orientation: "vertical", className: "h-6" }), _jsx("div", { className: "flex-1", children: _jsx("h1", { className: "text-xl font-bold", children: "Chi ti\u1EBFt \u0111\u01A1n h\u00E0ng" }) })] }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx("div", { className: `mb-6 rounded-xl ${statusInfo.bgColor} border-2 p-6`, children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-3", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border", children: [_jsx(Receipt, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "M\u00E3 \u0111\u01A1n:" }), _jsx("span", { className: "font-mono font-semibold text-sm", children: order.orderNumber }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 ml-1 hover:bg-muted", onClick: handleCopyOrderNumber, children: copied ? (_jsx(Check, { className: "w-3.5 h-3.5 text-green-600" })) : (_jsx(Copy, { className: "w-3.5 h-3.5 text-muted-foreground" })) })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border", children: [_jsx(Calendar, { className: "w-4 h-4 text-muted-foreground" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "\u0110\u1EB7t ng\u00E0y:" }), _jsx("span", { className: "text-sm font-medium", children: new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) })] })] }) }), _jsxs(Badge, { className: `${statusInfo.bgColor} ${statusInfo.color} border px-4 py-2 text-sm font-semibold`, children: [_jsx(StatusIcon, { className: "w-4 h-4 mr-2" }), statusInfo.label] })] }) }), _jsxs("div", { className: "space-y-6", children: [order.expiresAt && order.status === 'pending' && (_jsx(Card, { className: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30", children: _jsxs("div", { className: "p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-semibold text-orange-900 dark:text-orange-100 mb-1", children: "H\u1EBFt h\u1EA1n thanh to\u00E1n" }), _jsxs("p", { className: "text-sm text-orange-700 dark:text-orange-300", children: ["Vui l\u00F2ng thanh to\u00E1n tr\u01B0\u1EDBc", ' ', _jsx("span", { className: "font-semibold", children: new Date(order.expiresAt).toLocaleString('vi-VN', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) })] })] })] }) })), order.timeline && order.timeline.length > 0 && (_jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-lg mb-5 flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(Package, { className: "w-4 h-4 text-primary" }) }), "L\u1ECBch s\u1EED \u0111\u01A1n h\u00E0ng"] }), _jsx("div", { className: "space-y-4", children: order.timeline.map((item, index) => {
                                                const itemStatusInfo = getStatusConfig(item.status);
                                                const ItemIcon = itemStatusInfo.icon;
                                                const isLast = index === order.timeline.length - 1;
                                                return (_jsxs("div", { className: "flex gap-4 relative", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `w-10 h-10 rounded-full ${itemStatusInfo.bgColor} border-2 border-background flex items-center justify-center shadow-sm z-10`, children: _jsx(ItemIcon, { className: `w-5 h-5 ${itemStatusInfo.color}` }) }), !isLast && (_jsx("div", { className: "absolute left-[21px] top-10 w-0.5 h-full bg-border" }))] }), _jsxs("div", { className: "flex-1 pb-6 pt-1", children: [_jsx("p", { className: "font-semibold text-base mb-1", children: item.description }), _jsx("p", { className: "text-sm text-muted-foreground", children: new Date(item.timestamp).toLocaleString('vi-VN', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }) })] })] }, index));
                                            }) })] }) })), _jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(Package, { className: "w-4 h-4 text-primary" }) }), "S\u1EA3n ph\u1EA9m (", order.items.length, ")"] }), _jsx("div", { className: "space-y-3", children: order.items.map((item) => (_jsxs("div", { className: "flex gap-4 p-4 bg-muted/50 rounded-xl border hover:bg-muted/70 transition-colors", children: [_jsx("div", { className: "w-24 h-24 rounded-xl overflow-hidden bg-background border-2 shrink-0 shadow-sm", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-base line-clamp-2 mb-2", children: item.name }), item.variant && (_jsxs("p", { className: "text-sm text-muted-foreground mb-3", children: ["Ph\u00E2n lo\u1EA1i: ", _jsx("span", { className: "font-medium", children: item.variant })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["S\u1ED1 l\u01B0\u1EE3ng: ", _jsx("span", { className: "font-semibold text-foreground", children: item.quantity })] }), _jsx("span", { className: "font-bold text-lg text-primary", children: formatPrice(item.price) })] })] })] }, item.id))) })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-base mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center", children: _jsx(MapPin, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }) }), "\u0110\u1ECBa ch\u1EC9 nh\u1EADn h\u00E0ng"] }), _jsx("div", { className: "space-y-3", children: (() => {
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
                                                            }
                                                            else if (parts.length === 2) {
                                                                recipientName = parts[0].trim();
                                                                recipientPhone = parts[1].trim();
                                                                recipientAddress = '';
                                                            }
                                                            else {
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
                                                        return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "T\u00EAn ng\u01B0\u1EDDi nh\u1EADn:" }), _jsx("p", { className: "font-semibold text-base", children: recipientName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i:" }), _jsxs("p", { className: "text-sm text-foreground flex items-center gap-2", children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), recipientPhone] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "\u0110\u1ECBa ch\u1EC9 nh\u1EADn h\u00E0ng:" }), _jsx("p", { className: "text-sm leading-relaxed break-words", children: recipientAddress })] })] }));
                                                    })() })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-base mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center", children: _jsx(CreditCard, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }), "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n"] }), _jsx("p", { className: "font-semibold text-base", children: getPaymentMethodLabel(order.paymentMethod) })] }) }), _jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-base mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center", children: _jsx(Truck, { className: "w-4 h-4 text-purple-600 dark:text-purple-400" }) }), "V\u1EADn chuy\u1EC3n"] }), _jsx("p", { className: "font-semibold text-base mb-2", children: order.shippingMethod || 'Tiêu chuẩn' }), order.trackingNumber && (_jsxs("div", { className: "mt-3 pt-3 border-t", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "M\u00E3 v\u1EADn \u0111\u01A1n:" }), _jsx("p", { className: "font-mono font-semibold text-sm", children: order.trackingNumber })] }))] }) })] })] }), order.note && (_jsx(Card, { className: "border-2", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-base mb-3 flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center", children: _jsx(MessageSquare, { className: "w-4 h-4 text-amber-600 dark:text-amber-400" }) }), "Ghi ch\u00FA"] }), _jsx("p", { className: "text-sm leading-relaxed bg-muted/30 p-3 rounded-lg", children: order.note })] }) })), _jsx(Card, { className: "border-2 bg-gradient-to-br from-primary/5 to-primary/10", children: _jsxs("div", { className: "p-5", children: [_jsxs("h3", { className: "font-bold text-lg mb-4 flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center", children: _jsx(Wallet, { className: "w-4 h-4 text-primary" }) }), "T\u1ED5ng ti\u1EC1n"] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "T\u1EA1m t\u00EDnh:" }), _jsx("span", { className: "font-medium", children: formatPrice(order.totalPrice) })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Ph\u00ED v\u1EADn chuy\u1EC3n:" }), _jsx("span", { className: "font-medium", children: order.shippingFee === 0 ? (_jsx("span", { className: "text-green-600 dark:text-green-400", children: "Mi\u1EC5n ph\u00ED" })) : (formatPrice(order.shippingFee)) })] }), order.voucherDiscount && order.voucherDiscount > 0 && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [_jsx(TrendingDown, { className: "w-3.5 h-3.5" }), "Gi\u1EA3m gi\u00E1 voucher:"] }), _jsxs("span", { className: "font-semibold text-green-600 dark:text-green-400", children: ["-", formatPrice(order.voucherDiscount)] })] })), order.paymentDiscount && order.paymentDiscount > 0 && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [_jsx(TrendingDown, { className: "w-3.5 h-3.5" }), "Gi\u1EA3m gi\u00E1 thanh to\u00E1n:"] }), _jsxs("span", { className: "font-semibold text-green-600 dark:text-green-400", children: ["-", formatPrice(order.paymentDiscount)] })] })), order.discount > 0 && (!order.voucherDiscount || !order.paymentDiscount) && (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [_jsx(TrendingDown, { className: "w-3.5 h-3.5" }), "Gi\u1EA3m gi\u00E1:"] }), _jsxs("span", { className: "font-semibold text-green-600 dark:text-green-400", children: ["-", formatPrice(order.discount)] })] })), _jsx(Separator, { className: "my-3" }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsx("span", { className: "font-bold text-lg", children: "T\u1ED5ng c\u1ED9ng:" }), _jsx("span", { className: "text-2xl font-bold text-primary", children: formatPrice(order.finalPrice) })] })] })] }) })] }), _jsxs("div", { className: "mt-8 p-6 bg-muted/30 rounded-xl border flex flex-wrap items-center justify-end gap-3", children: [order.status === 'pending' && app.handleCancelOrder && (_jsxs(Button, { variant: "destructive", onClick: handleCancelOrder, className: "gap-2", children: [_jsx(XCircle, { className: "w-4 h-4" }), "H\u1EE7y \u0111\u01A1n h\u00E0ng"] })), order.status === 'completed' && app.handleReview && (_jsxs(Button, { variant: "default", onClick: handleReview, className: "gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), "\u0110\u00E1nh gi\u00E1"] })), app.handleReorder && (_jsxs(Button, { variant: "outline", onClick: () => {
                                    app.handleReorder(order.id);
                                    navigate('/cart');
                                }, className: "gap-2", children: [_jsx(RotateCcw, { className: "w-4 h-4" }), "Mua l\u1EA1i"] })), app.handleContactShop && order.ownerId && (_jsxs(Button, { variant: "outline", onClick: () => {
                                    // Trigger chat với shop của đơn hàng
                                    const event = new CustomEvent('openChat', { detail: { targetUserId: order.ownerId } });
                                    window.dispatchEvent(event);
                                }, className: "gap-2", children: [_jsx(MessageSquare, { className: "w-4 h-4" }), "Li\u00EAn h\u1EC7 Shop"] }))] })] })] }));
}
