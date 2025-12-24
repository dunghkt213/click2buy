import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OrderCard - Component hiển thị thông tin một đơn hàng cho seller
 */
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice } from '../../utils/utils';
const STATUS_LABELS = {
    pending: 'Chờ xác nhận',
    confirmed: 'Chờ xử lý', // PENDING_ACCEPT - đang chờ seller xác nhận
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancel_request: 'Yêu cầu hủy',
};
export function OrderCard({ order, onUpdateStatus, showActionButtons = true }) {
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    return (_jsxs(Card, { className: "overflow-hidden", children: [_jsx("div", { className: "p-4 bg-muted/30 border-b", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: order.orderNumber }), _jsx("p", { className: "text-sm text-muted-foreground", children: new Date(order.createdAt).toLocaleString('vi-VN') })] }), _jsx(Badge, { children: statusLabel })] }) }), _jsxs("div", { className: "p-4", children: [_jsx("div", { className: "space-y-3 mb-4", children: order.items.map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium line-clamp-1 wrap-break-word", children: item.name }), item.variant && (_jsx("p", { className: "text-sm text-muted-foreground", children: item.variant }))] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["x", item.quantity] }), _jsx("p", { className: "font-medium", children: formatPrice(item.price) })] })] }, item.id))) }), _jsxs("div", { className: "pt-3 border-t", children: [_jsxs("div", { className: "space-y-2 mb-3", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm font-medium text-foreground", children: "Th\u00F4ng tin kh\u00E1ch h\u00E0ng:" }), _jsxs("div", { className: "flex items-start gap-3 pl-2", children: [order.user?.avatar && (_jsxs(Avatar, { className: "w-10 h-10 shrink-0", children: [_jsx(AvatarImage, { src: order.user.avatar, alt: order.user.name || order.user.username }), _jsx(AvatarFallback, { children: (order.user.name || order.user.username || 'U').charAt(0).toUpperCase() })] })), _jsxs("div", { className: "flex-1 space-y-1 min-w-0", children: [_jsxs("p", { className: "text-sm text-foreground", children: [_jsx("span", { className: "font-medium", children: "T\u00EAn:" }), " ", order.user?.name || order.user?.username || order.shippingAddress?.name || 'N/A'] }), order.user?.phone && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [_jsx("span", { className: "font-medium", children: "S\u0110T:" }), " ", order.user.phone] })), order.user?.email && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [_jsx("span", { className: "font-medium", children: "Email:" }), " ", order.user.email] })), order.shippingAddress?.phone && order.shippingAddress.phone !== order.user?.phone && (_jsxs("p", { className: "text-sm text-muted-foreground", children: [_jsx("span", { className: "font-medium", children: "S\u0110T giao h\u00E0ng:" }), " ", order.shippingAddress.phone] })), (order.address || order.shippingAddress?.address) && (_jsxs("div", { className: "mt-2 pt-2 border-t", children: [_jsx("p", { className: "text-sm font-medium text-foreground mb-1", children: "\u0110\u1ECBa ch\u1EC9 nh\u1EADn h\u00E0ng:" }), _jsx("p", { className: "text-sm text-muted-foreground break-words pl-2", children: order.address || order.shippingAddress?.address })] }))] })] })] }), _jsxs("div", { className: "text-right pt-2 border-t", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "T\u1ED5ng ti\u1EC1n:" }), _jsx("p", { className: "text-xl font-bold text-primary", children: formatPrice(order.finalPrice) })] })] }), showActionButtons && order.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => onUpdateStatus(order.id, 'confirmed'), children: "X\u00E1c nh\u1EADn \u0111\u01A1n" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                            if (confirm('Hủy đơn?')) {
                                                onUpdateStatus(order.id, 'cancelled');
                                            }
                                        }, children: "H\u1EE7y \u0111\u01A1n" })] })), showActionButtons && order.status === 'confirmed' && (_jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx(Button, { size: "sm", onClick: () => onUpdateStatus(order.id, 'confirm'), children: "X\u00E1c nh\u1EADn" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                            if (confirm('Bạn có chắc muốn từ chối đơn hàng này?')) {
                                                onUpdateStatus(order.id, 'reject');
                                            }
                                        }, children: "H\u1EE7y \u0111\u01A1n" })] })), showActionButtons && order.status === 'cancel_request' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: () => onUpdateStatus(order.id, 'accept_cancel'), children: "\u0110\u1ED3ng \u00FD h\u1EE7y" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                            if (confirm('Bạn có chắc muốn từ chối yêu cầu hủy đơn hàng này?')) {
                                                onUpdateStatus(order.id, 'reject_cancel');
                                            }
                                        }, children: "T\u1EEB ch\u1ED1i h\u1EE7y" })] }))] })] })] }, order.id));
}
