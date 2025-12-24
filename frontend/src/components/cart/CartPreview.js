import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
export function CartPreview({ items, totalPrice, onViewCart }) {
    // Chỉ hiển thị tối đa 3 sản phẩm
    const displayItems = items.slice(0, 3);
    const hasMoreItems = items.length > 3;
    if (items.length === 0) {
        return (_jsx("div", { className: "p-4", children: _jsxs("div", { className: "text-center py-8", children: [_jsx(ShoppingCart, { className: "w-12 h-12 mx-auto mb-3 text-muted-foreground" }), _jsx("p", { className: "text-muted-foreground", children: "Gi\u1ECF h\u00E0ng tr\u1ED1ng" })] }) }));
    }
    return (_jsx("div", { className: "w-full max-w-full", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold", children: "S\u1EA3n ph\u1EA9m m\u1EDBi th\u00EAm" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [items.length, " s\u1EA3n ph\u1EA9m"] })] }), _jsx(Separator, { className: "mb-3" }), _jsxs("div", { className: "space-y-3 max-h-80 overflow-y-auto", children: [displayItems.map((item) => (_jsxs("div", { className: "flex gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors", children: [_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0 overflow-hidden", children: [_jsx("p", { className: "text-sm font-medium line-clamp-1 break-words", children: item.name }), _jsxs("div", { className: "flex items-center justify-between mt-1 gap-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground shrink-0", children: ["x", item.quantity] }), _jsx("span", { className: "text-sm font-semibold text-primary shrink-0 whitespace-nowrap", children: formatPrice(item.price * item.quantity) })] })] })] }, item.id))), hasMoreItems && (_jsx("div", { className: "text-center py-2", children: _jsxs("p", { className: "text-sm text-muted-foreground", children: ["+ ", items.length - 3, " s\u1EA3n ph\u1EA9m kh\u00E1c"] }) }))] }), _jsx(Separator, { className: "my-3" }), _jsxs("div", { className: "flex items-center justify-between mb-3 gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground shrink-0", children: "T\u1ED5ng t\u1EA1m t\u00EDnh:" }), _jsx("span", { className: "font-semibold shrink-0 whitespace-nowrap", children: formatPrice(totalPrice) })] }), _jsxs(Button, { onClick: onViewCart, className: "w-full bg-primary hover:bg-primary/90", children: ["Xem gi\u1ECF h\u00E0ng", _jsx(ArrowRight, { className: "w-4 h-4 ml-2" })] })] }) }));
}
