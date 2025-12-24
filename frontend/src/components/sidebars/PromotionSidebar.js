import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Calendar, Clock, Flame, Gift, Percent, ShoppingCart, Star, Tag, Timer, Trophy, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
export function PromotionSidebar({ isOpen, onClose, promotions, onClaimPromotion, onUsePromotion }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };
    const getPromotionIcon = (type) => {
        switch (type) {
            case 'flash-sale':
                return Zap;
            case 'discount':
                return Percent;
            case 'voucher':
                return Tag;
            case 'cashback':
                return Gift;
            case 'gift':
                return Trophy;
            case 'event':
                return Calendar;
            default:
                return Tag;
        }
    };
    const getPromotionColor = (type) => {
        switch (type) {
            case 'flash-sale':
                return 'text-red-600';
            case 'discount':
                return 'text-blue-600';
            case 'voucher':
                return 'text-green-600';
            case 'cashback':
                return 'text-purple-600';
            case 'gift':
                return 'text-yellow-600';
            case 'event':
                return 'text-pink-600';
            default:
                return 'text-gray-600';
        }
    };
    const getTimeRemaining = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        if (diff <= 0)
            return 'Đã hết hạn';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `Còn ${days} ngày`;
        }
        return `Còn ${hours}h ${minutes}m`;
    };
    const activePromotions = promotions.filter(p => p.isActive);
    const expiredPromotions = promotions.filter(p => !p.isActive);
    const motionEase = [0.4, 0, 0.2, 1];
    const listVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } },
    };
    return (_jsx(Sheet, { open: isOpen, onOpenChange: onClose, children: _jsx(SheetContent, { className: "w-full sm:w-[480px] flex flex-col p-0 h-full max-h-screen", children: _jsxs(motion.div, { className: "flex flex-col h-full", initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } }, children: [_jsx("div", { className: "px-6 py-4 border-b border-border bg-card", children: _jsx(SheetHeader, { children: _jsxs(SheetTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center", children: _jsx(Tag, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { children: "Khuy\u1EBFn m\u00E3i" }), _jsxs(SheetDescription, { children: [activePromotions.length, " \u01B0u \u0111\u00E3i \u0111ang di\u1EC5n ra"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Flame, { className: "w-5 h-5 text-orange-500" }), _jsx(Badge, { className: "bg-gradient-to-r from-orange-500 to-red-500 text-white", children: "HOT" })] })] }) }) }), activePromotions.length === 0 ? (_jsxs(motion.div, { className: "flex-1 flex flex-col items-center justify-center space-y-6 px-6", initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: motionEase } }, children: [_jsx("div", { className: "w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center", children: _jsx(Tag, { className: "w-16 h-16 text-orange-500" }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Ch\u01B0a c\u00F3 khuy\u1EBFn m\u00E3i" }), _jsx("p", { className: "text-muted-foreground text-sm max-w-[280px]", children: "Theo d\u00F5i th\u01B0\u1EDDng xuy\u00EAn \u0111\u1EC3 kh\u00F4ng b\u1ECF l\u1EE1 c\u00E1c ch\u01B0\u01A1ng tr\u00ECnh khuy\u1EBFn m\u00E3i h\u1EA5p d\u1EABn" })] }), _jsx(Button, { onClick: onClose, className: "px-8", children: "Kh\u00E1m ph\u00E1 s\u1EA3n ph\u1EA9m" })] })) : (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white", initial: { opacity: 0.6 }, animate: { opacity: 1, transition: { duration: 0.4, ease: motionEase } }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-white/20 rounded-full flex items-center justify-center", children: _jsx(Zap, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: "Flash Sale 12.12" }), _jsx("p", { className: "text-sm opacity-90", children: "Gi\u1EA3m t\u1EDBi 70% - S\u1ED1 l\u01B0\u1EE3ng c\u00F3 h\u1EA1n" })] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Timer, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-mono", children: "12:34:56" })] }) })] }) }), _jsx(ScrollArea, { className: "flex-1 px-6 min-h-0", children: _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-500" }), "\u01AFu \u0111\u00E3i \u0111ang di\u1EC5n ra"] }), _jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", children: activePromotions.map((promotion) => {
                                                        const IconComponent = getPromotionIcon(promotion.type);
                                                        const iconColor = getPromotionColor(promotion.type);
                                                        return (_jsxs(motion.div, { variants: itemVariants, className: "relative p-4 border border-border rounded-xl transition-all duration-200 hover:shadow-md hover:border-primary/20 bg-gradient-to-r from-white to-gray-50 dark:from-gray-950 dark:to-gray-900", children: [promotion.isHot && (_jsxs(Badge, { className: "absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white z-10", children: [_jsx(Flame, { className: "w-3 h-3 mr-1" }), "HOT"] })), _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: `w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 ${iconColor} flex-shrink-0`, children: _jsx(IconComponent, { className: "w-6 h-6" }) }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "font-semibold text-sm", children: promotion.title }), promotion.isLimited && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "C\u00F3 h\u1EA1n" }))] }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: promotion.description })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg font-bold text-primary", children: promotion.discount }), promotion.minOrderValue && (_jsxs("span", { className: "text-xs text-muted-foreground", children: ["\u0110\u01A1n t\u1ED1i thi\u1EC3u ", formatPrice(promotion.minOrderValue)] }))] }), promotion.progress !== undefined && promotion.total && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { children: ["\u0110\u00E3 s\u1EED d\u1EE5ng: ", promotion.claimed, "/", promotion.total] }), _jsxs("span", { children: [Math.round((promotion.claimed || 0) / promotion.total * 100), "%"] })] }), _jsx(Progress, { value: promotion.progress, className: "h-2" })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: getTimeRemaining(promotion.endDate) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [promotion.code && (_jsx(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", onClick: () => navigator.clipboard.writeText(promotion.code), children: promotion.code })), _jsxs(Button, { size: "sm", className: "h-7 text-xs gap-1", onClick: () => onUsePromotion(promotion.id), children: [_jsx(ShoppingCart, { className: "w-3 h-3" }), "D\u00F9ng ngay"] })] })] })] })] })] }, promotion.id));
                                                    }) })] }), expiredPromotions.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3 text-muted-foreground", children: "\u0110\u00E3 h\u1EBFt h\u1EA1n" }), _jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", children: expiredPromotions.slice(0, 3).map((promotion) => {
                                                                const IconComponent = getPromotionIcon(promotion.type);
                                                                return (_jsx(motion.div, { variants: itemVariants, className: "p-4 border border-border rounded-xl bg-muted/30 opacity-60", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center bg-muted text-muted-foreground flex-shrink-0", children: _jsx(IconComponent, { className: "w-6 h-6" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-sm", children: promotion.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: promotion.discount })] })] }) }, promotion.id));
                                                            }) })] })] }))] }) }), _jsxs(motion.div, { className: "bg-muted/30 border-t border-border p-6 space-y-4", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } }, children: [_jsx("div", { className: "flex items-center justify-center text-center space-y-2", children: _jsx("div", { className: "text-sm text-muted-foreground", children: _jsx("p", { children: "\uD83C\uDF89 \u0110\u0103ng k\u00FD nh\u1EADn th\u00F4ng b\u00E1o khuy\u1EBFn m\u00E3i m\u1EDBi nh\u1EA5t" }) }) }), _jsx(Button, { variant: "outline", className: "w-full", onClick: onClose, children: "\u0110\u00F3ng" })] })] }))] }) }) }));
}
