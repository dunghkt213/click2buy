import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OrderList - Component hiển thị danh sách đơn hàng với empty state
 */
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Card } from '../ui/card';
import { OrderCard } from './OrderCard';
export function OrderList({ orders, onUpdateStatus, showActionButtons = true }) {
    if (orders.length === 0) {
        return (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg mb-2", children: "Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng" })] }) }));
    }
    return (_jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, className: "space-y-4", children: orders.map((order) => (_jsx(OrderCard, { order: order, onUpdateStatus: onUpdateStatus, showActionButtons: showActionButtons }, order.id))) }));
}
