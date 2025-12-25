import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { ArrowRight, Shield, ShoppingBag, Sparkles, Star, Truck, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
export function Hero({ onShopNowClick }) {
    const features = [
        { icon: Zap, text: 'Giao hàng nhanh', color: 'text-yellow-500' },
        { icon: Shield, text: 'Bảo hành chính hãng', color: 'text-blue-500' },
        { icon: Truck, text: 'Miễn phí vận chuyển', color: 'text-green-500' },
        { icon: Star, text: 'Đánh giá 5 sao', color: 'text-amber-500' },
    ];
    const stats = [
        { number: '100K+', label: 'Khách hàng tin tưởng', icon: '👥' },
        { number: '1M+', label: 'Sản phẩm đa dạng', icon: '📦' },
        { number: '99%', label: 'Khách hàng hài lòng', icon: '😊' },
        { number: '24/7', label: 'Hỗ trợ khách hàng', icon: '💬' },
    ];
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };
    return (_jsxs("section", { className: "relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-0 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" })] }), _jsx("div", { className: "relative container mx-auto px-4 py-16 lg:py-24", children: _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "grid lg:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { className: "space-y-6 z-10", children: [_jsx(motion.div, { variants: itemVariants, children: _jsxs(Badge, { variant: "secondary", className: "w-fit mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors", children: [_jsx(Sparkles, { className: "w-3 h-3 mr-2" }), "Khuy\u1EBFn m\u00E3i \u0111\u1EB7c bi\u1EC7t - Gi\u1EA3m \u0111\u1EBFn 50%"] }) }), _jsxs(motion.h1, { variants: itemVariants, className: "text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight", children: [_jsx("span", { className: "block text-foreground", children: "Mua s\u1EAFm" }), _jsx("span", { className: "block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent", children: "Th\u00F4ng minh" }), _jsx("span", { className: "block text-foreground", children: "Gi\u00E1 t\u1ED1t nh\u1EA5t" })] }), _jsx(motion.p, { variants: itemVariants, className: "text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed", children: "Kh\u00E1m ph\u00E1 h\u00E0ng tri\u1EC7u s\u1EA3n ph\u1EA9m ch\u1EA5t l\u01B0\u1EE3ng t\u1EEB th\u1EDDi trang, \u0111i\u1EC7n t\u1EED \u0111\u1EBFn nh\u00E0 c\u1EEDa v\u1EDBi gi\u00E1 c\u1EA3 c\u1EA1nh tranh nh\u1EA5t th\u1ECB tr\u01B0\u1EDDng." }), _jsx(motion.div, { variants: itemVariants, className: "flex flex-col sm:flex-row gap-4 pt-2", children: _jsxs(Button, { size: "lg", className: "group text-base px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all", onClick: onShopNowClick, children: [_jsx(ShoppingBag, { className: "w-5 h-5 mr-2 group-hover:scale-110 transition-transform" }), "Mua s\u1EAFm ngay", _jsx(ArrowRight, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })] }) }), _jsx(motion.div, { variants: itemVariants, className: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4", children: features.map((feature, index) => (_jsxs(motion.div, { whileHover: { scale: 1.05, y: -2 }, className: "flex flex-col items-center gap-2 p-4 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer group", children: [_jsx("div", { className: `w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all`, children: _jsx(feature.icon, { className: `w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform` }) }), _jsx("span", { className: "text-xs sm:text-sm text-muted-foreground text-center font-medium group-hover:text-foreground transition-colors", children: feature.text })] }, index))) })] }), _jsx(motion.div, { variants: itemVariants, className: "relative hidden lg:block", children: _jsx("div", { className: "relative", children: _jsxs("div", { className: "relative bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 border border-primary/20 shadow-2xl backdrop-blur-sm", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" }), _jsx(motion.div, { animate: {
                                                y: [0, -10, 0],
                                            }, transition: {
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }, className: "absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center", children: _jsx(Star, { className: "w-10 h-10 text-primary" }) }), _jsx(motion.div, { animate: {
                                                y: [0, 10, 0],
                                            }, transition: {
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: 0.5,
                                            }, className: "absolute -bottom-4 -left-4 w-16 h-16 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center", children: _jsx(Zap, { className: "w-8 h-8 text-primary" }) }), _jsxs("div", { className: "relative z-10 space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "text-4xl font-bold text-primary", children: "50%" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Gi\u1EA3m gi\u00E1 h\u00F4m nay" })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: stats.slice(0, 4).map((stat, index) => (_jsxs("div", { className: "text-center p-4 bg-background/50 rounded-xl border border-border/50", children: [_jsx("div", { className: "text-2xl mb-1", children: stat.icon }), _jsx("div", { className: "text-lg font-bold text-foreground", children: stat.number }), _jsx("div", { className: "text-xs text-muted-foreground", children: stat.label })] }, index))) })] })] }) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.8, duration: 0.5 }, className: "relative border-t border-border/50 bg-card/30 backdrop-blur-md", children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8", children: stats.map((stat, index) => (_jsxs(motion.div, { whileHover: { scale: 1.05 }, className: "text-center p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-border/30 hover:border-primary/30", children: [_jsx("div", { className: "text-3xl mb-2", children: stat.icon }), _jsx("div", { className: "text-2xl lg:text-3xl font-bold text-primary mb-1", children: stat.number }), _jsx("div", { className: "text-sm text-muted-foreground font-medium", children: stat.label })] }, index))) }) }) })] }));
}
