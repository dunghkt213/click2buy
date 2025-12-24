import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { calculateDiscount, formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
export function ProductCard({ product, onAddToCart, viewMode = 'grid', onViewDetail, onTriggerFlyingIcon, isLoggedIn = false, onLogin }) {
    const [isHovered, setIsHovered] = useState(false);
    const discountPercent = product.originalPrice
        ? calculateDiscount(product.originalPrice, product.price)
        : 0;
    // THÊM: Handler cho add to cart
    const handleAddToCart = (e) => {
        e.stopPropagation(); // Ngăn không cho trigger xem chi tiết
        if (!isLoggedIn) {
            e.preventDefault();
            onLogin?.();
            return;
        }
        // Trigger flying animation
        if (onTriggerFlyingIcon) {
            onTriggerFlyingIcon('cart', e.currentTarget);
        }
        onAddToCart(product);
    };
    // Handler để xem chi tiết sản phẩm khi click vào card
    const handleCardClick = () => {
        if (onViewDetail) {
            onViewDetail(product);
        }
    };
    if (viewMode === 'list') {
        return (_jsx(Card, { className: "group hover:shadow-lg transition-all duration-300 cursor-pointer", onClick: handleCardClick, children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "flex gap-6", children: [_jsxs("div", { className: "relative w-48 h-48 bg-muted/20 rounded-l-lg overflow-hidden flex-shrink-0", children: [_jsx(ImageWithFallback, { src: product.image, alt: product.name, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" }), _jsxs("div", { className: "absolute top-3 left-3 flex flex-col gap-2", children: [product.isNew && (_jsx(Badge, { className: "bg-green-500 hover:bg-green-600", children: "M\u1EDBi" })), product.isSale && discountPercent > 0 && (_jsxs(Badge, { variant: "destructive", children: ["-", discountPercent, "%"] }))] }), !product.inStock && (_jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: _jsx(Badge, { variant: "secondary", children: "H\u1EBFt h\u00E0ng" }) }))] }), _jsxs("div", { className: "flex-1 p-6 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: product.brand }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-500 fill-current" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [product.ratingAvg || product.rating, " (", product.reviews, ")"] })] })] }), _jsx("h3", { className: "font-semibold text-lg mb-2 line-clamp-2", children: product.name }), _jsx("p", { className: "text-muted-foreground text-sm mb-4 line-clamp-2", children: product.description }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("span", { className: "text-2xl font-bold text-primary", children: formatPrice(product.price) }), product.originalPrice && (_jsx("span", { className: "text-lg text-muted-foreground line-through", children: formatPrice(product.originalPrice) }))] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { className: "flex-1 gap-2 text-black [&>svg]:text-black", onClick: handleAddToCart, disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-4 h-4 text-black" }), _jsx("span", { className: "text-black", children: product.inStock ? 'Thêm vào giỏ' : 'Hết hàng' })] }) })] })] }) }) }));
    }
    return (_jsx(Card, { className: "group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden cursor-pointer", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onClick: handleCardClick, children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "relative aspect-square bg-muted/20 overflow-hidden", children: [_jsx(ImageWithFallback, { src: product.image, alt: product.name, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" }), _jsxs("div", { className: "absolute top-2 left-2 flex flex-col gap-1.5", children: [product.isNew && (_jsxs(Badge, { className: "bg-green-500 hover:bg-green-600 gap-1 text-xs px-1.5 py-0.5", children: [_jsx(Zap, { className: "w-2.5 h-2.5" }), "M\u1EDBi"] })), product.isSale && discountPercent > 0 && (_jsxs(Badge, { variant: "destructive", className: "text-xs px-1.5 py-0.5", children: ["-", discountPercent, "%"] }))] }), !product.inStock && (_jsx("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: _jsx(Badge, { variant: "secondary", className: "text-sm px-3 py-1.5", children: "H\u1EBFt h\u00E0ng" }) })), _jsx("div", { className: `absolute bottom-3 left-3 right-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`, children: _jsxs(Button, { className: "w-full gap-1.5 bg-white/90 backdrop-blur-sm text-black hover:bg-white hover:text-black [&>svg]:text-black text-xs h-8", onClick: handleAddToCart, disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-3.5 h-3.5 text-black" }), _jsx("span", { className: "text-black text-xs", children: "Th\u00EAm v\u00E0o gi\u1ECF" })] }) })] }), _jsxs("div", { className: "p-3 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0.5", children: product.brand }), _jsxs("div", { className: "flex items-center gap-0.5", children: [_jsx(Star, { className: "w-3 h-3 text-yellow-500 fill-current" }), _jsx("span", { className: "text-xs text-muted-foreground", children: product.ratingAvg || product.rating })] })] }), _jsx("h3", { className: "font-medium line-clamp-2 text-xs leading-tight min-h-[2.5rem]", children: product.name }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-sm font-bold text-primary", children: formatPrice(product.price) }), product.originalPrice && (_jsx("span", { className: "text-xs text-muted-foreground line-through", children: formatPrice(product.originalPrice) }))] }), _jsxs("div", { className: "text-[10px] text-muted-foreground", children: [product.reviews, " \u0111\u00E1nh gi\u00E1"] })] })] })] }) }));
}
