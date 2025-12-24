import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Share2, ThumbsUp, ChevronLeft, ChevronRight, Package, Shield, TruckIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
export function ProductDetailModal({ isOpen, onClose, product, onAddToCart, onAddToWishlist, }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    if (!isOpen || !product)
        return null;
    // Mock data cho nhiều ảnh sản phẩm
    const productImages = product.images || [product.image, product.image, product.image];
    // Mock data cho đánh giá chi tiết
    const ratingBreakdown = [
        { stars: 5, count: 1250, percentage: 75 },
        { stars: 4, count: 280, percentage: 17 },
        { stars: 3, count: 83, percentage: 5 },
        { stars: 2, count: 33, percentage: 2 },
        { stars: 1, count: 17, percentage: 1 },
    ];
    // Mock data cho reviews
    const mockReviews = [
        {
            id: '1',
            userId: 'u1',
            userName: 'Nguyễn Văn A',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            rating: 5,
            comment: 'Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Tôi rất hài lòng với sản phẩm này!',
            date: '2024-01-15',
            helpful: 24,
            isVerifiedPurchase: true,
        },
        {
            id: '2',
            userId: 'u2',
            userName: 'Trần Thị B',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            rating: 4,
            comment: 'Chất lượng tốt, giá cả hợp lý. Chỉ tiếc là màu sắc hơi khác so với hình ảnh một chút.',
            date: '2024-01-12',
            helpful: 15,
            isVerifiedPurchase: true,
        },
        {
            id: '3',
            userId: 'u3',
            userName: 'Lê Văn C',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
            rating: 5,
            comment: 'Tuyệt vời! Đã mua lần 2 rồi, sẽ tiếp tục ủng hộ shop.',
            date: '2024-01-10',
            helpful: 8,
            isVerifiedPurchase: true,
        },
    ];
    // Thông số kỹ thuật
    const specifications = product.specifications || {
        'Thương hiệu': product.brand,
        'Xuất xứ': 'Việt Nam',
        'Bảo hành': '12 tháng',
        'Số lượng còn lại': typeof product.stock === 'number' ? `${product.stock} sản phẩm` : '0 sản phẩm',
    };
    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
    };
    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
    };
    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };
    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
    };
    const soldCount = product.soldCount || Math.floor(Math.random() * 10000);
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10", children: [_jsx("h2", { className: "text-lg", children: "Chi ti\u1EBFt s\u1EA3n ph\u1EA9m" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "w-8 h-8 p-0 rounded-full", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx(ScrollArea, { className: "h-[calc(90vh-80px)]", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "relative aspect-square bg-muted rounded-lg overflow-hidden mb-4", children: [_jsx("img", { src: productImages[selectedImageIndex], alt: product.name, className: "w-full h-full object-cover" }), product.isSale && (_jsxs(Badge, { className: "absolute top-4 left-4 bg-destructive", children: ["-", discount, "%"] })), product.isNew && (_jsx(Badge, { className: "absolute top-4 right-4 bg-blue-500", children: "M\u1EDBi" })), productImages.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", size: "sm", className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handlePrevImage, children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "secondary", size: "sm", className: "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handleNextImage, children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }))] }), _jsx("div", { className: "grid grid-cols-5 gap-2", children: productImages.map((img, idx) => (_jsx("button", { onClick: () => setSelectedImageIndex(idx), className: `aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex
                                                        ? 'border-primary'
                                                        : 'border-transparent hover:border-muted-foreground/30'}`, children: _jsx("img", { src: img, alt: `${product.name} ${idx + 1}`, className: "w-full h-full object-cover" }) }, idx))) })] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl mb-2", children: product.name }), _jsxs("div", { className: "flex items-center gap-4 mb-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-primary", children: product.rating }), _jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-4 h-4 ${star <= product.rating
                                                                        ? 'fill-primary text-primary'
                                                                        : 'text-muted-foreground/30'}` }, star))) })] }), _jsx(Separator, { orientation: "vertical", className: "h-4" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [product.reviews.toLocaleString(), " \u0110\u00E1nh gi\u00E1"] }), _jsx(Separator, { orientation: "vertical", className: "h-4" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [soldCount.toLocaleString(), " \u0110\u00E3 b\u00E1n"] })] }), _jsx("div", { className: "bg-muted/50 p-4 rounded-lg mb-4", children: _jsxs("div", { className: "flex items-baseline gap-3", children: [product.originalPrice && (_jsxs("span", { className: "text-sm text-muted-foreground line-through", children: ["\u20AB", product.originalPrice.toLocaleString()] })), _jsxs("span", { className: "text-3xl text-primary", children: ["\u20AB", product.price.toLocaleString()] }), product.isSale && (_jsxs(Badge, { variant: "destructive", className: "ml-2", children: ["-", discount, "%"] }))] }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "Th\u01B0\u01A1ng hi\u1EC7u:" }), _jsx("span", { className: "text-sm", children: product.brand })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "S\u1ED1 l\u01B0\u1EE3ng c\u00F2n l\u1EA1i:" }), _jsx("span", { className: "text-sm font-medium", children: typeof product.stock === 'number' ? `${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("span", { className: "text-sm text-muted-foreground block mb-2", children: "S\u1ED1 l\u01B0\u1EE3ng:" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center border border-border rounded-lg", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(-1), disabled: quantity <= 1, className: "h-10 w-10 p-0 rounded-none", children: "-" }), _jsx("span", { className: "w-12 text-center", children: quantity }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(1), className: "h-10 w-10 p-0 rounded-none", children: "+" })] }), _jsx("span", { className: "text-sm text-muted-foreground", children: typeof product.stock === 'number' ? `Còn ${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "flex gap-3 mb-6", children: [_jsxs(Button, { variant: "outline", className: "flex-1 gap-2", onClick: handleAddToCart, disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "Th\u00EAm v\u00E0o gi\u1ECF h\u00E0ng"] }), _jsx(Button, { className: "flex-1 gap-2", onClick: handleAddToCart, disabled: !product.inStock, children: "Mua ngay" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "flex-1 gap-2", onClick: () => onAddToWishlist?.(product), children: [_jsx(Heart, { className: "w-4 h-4" }), "Y\u00EAu th\u00EDch"] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "flex-1 gap-2", children: [_jsx(Share2, { className: "w-4 h-4" }), "Chia s\u1EBB"] })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-border space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Shield, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "B\u1EA3o h\u00E0nh ch\u00EDnh h\u00E3ng 12 th\u00E1ng" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Package, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "\u0110\u1ED5i tr\u1EA3 mi\u1EC5n ph\u00ED trong 7 ng\u00E0y" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(TruckIcon, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "Mi\u1EC5n ph\u00ED v\u1EADn chuy\u1EC3n cho \u0111\u01A1n t\u1EEB 500.000\u0111" })] })] })] })] }), _jsxs(Tabs, { defaultValue: "description", className: "w-full", children: [_jsxs(TabsList, { className: "w-full justify-start border-b rounded-none h-auto p-0 bg-transparent", children: [_jsx(TabsTrigger, { value: "description", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: "M\u00F4 t\u1EA3 s\u1EA3n ph\u1EA9m" }), _jsx(TabsTrigger, { value: "specifications", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: "Th\u00F4ng s\u1ED1 k\u1EF9 thu\u1EADt" }), _jsxs(TabsTrigger, { value: "reviews", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: ["\u0110\u00E1nh gi\u00E1 (", product.reviews, ")"] })] }), _jsx(TabsContent, { value: "description", className: "py-6", children: _jsxs("div", { className: "prose prose-sm max-w-none", children: [_jsx("p", { children: product.description }), _jsx("p", { className: "mt-4", children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." })] }) }), _jsx(TabsContent, { value: "specifications", className: "py-6", children: _jsx("div", { className: "space-y-3", children: Object.entries(specifications).map(([key, value]) => (_jsxs("div", { className: "flex py-2 border-b border-border", children: [_jsx("span", { className: "text-sm text-muted-foreground w-1/3", children: key }), _jsx("span", { className: "text-sm flex-1", children: value })] }, key))) }) }), _jsxs(TabsContent, { value: "reviews", className: "py-6", children: [_jsx("div", { className: "bg-muted/30 rounded-lg p-6 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-5xl mb-2", children: product.rating }), _jsx("div", { className: "flex items-center justify-center gap-1 mb-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-5 h-5 ${star <= product.rating
                                                                            ? 'fill-primary text-primary'
                                                                            : 'text-muted-foreground/30'}` }, star))) }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [product.reviews.toLocaleString(), " \u0111\u00E1nh gi\u00E1"] })] }), _jsx("div", { className: "space-y-2", children: ratingBreakdown.map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-sm w-12", children: [item.stars, " sao"] }), _jsx(Progress, { value: item.percentage, className: "flex-1 h-2" }), _jsx("span", { className: "text-sm text-muted-foreground w-12 text-right", children: item.count })] }, item.stars))) })] }) }), _jsx("div", { className: "space-y-6", children: mockReviews.map((review) => (_jsx("div", { className: "border-b border-border pb-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx("img", { src: review.userAvatar, alt: review.userName }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { children: review.userName }), review.isVerifiedPurchase && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "\u0110\u00E3 mua h\u00E0ng" }))] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-3 h-3 ${star <= review.rating
                                                                                        ? 'fill-primary text-primary'
                                                                                        : 'text-muted-foreground/30'}` }, star))) }), _jsx("span", { className: "text-xs text-muted-foreground", children: review.date })] }), _jsx("p", { className: "text-sm mb-3", children: review.comment }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 h-8", children: [_jsx(ThumbsUp, { className: "w-3 h-3" }), "H\u1EEFu \u00EDch (", review.helpful, ")"] })] })] }) }, review.id))) })] })] })] }) })] }) }));
}
