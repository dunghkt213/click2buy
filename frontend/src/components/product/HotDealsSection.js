import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Clock, Flame, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { productApi } from '../../apis/product';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getCache, setCache, CACHE_KEYS } from '../../utils/cache';
export function HotDealsSection({ onAddToCart, onViewDetail, onTriggerFlyingIcon, isLoggedIn = false, onLogin }) {
    const navigate = useNavigate();
    const [allHotDeals, setAllHotDeals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const sectionHeaderRef = useRef(null);
    const isLoadingRef = useRef(false);
    // Tính discount percentage từ originalPrice và price
    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price)
            return 0;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };
    // Load hot deals products từ API
    useEffect(() => {
        loadHotDeals();
    }, []);
    const loadHotDeals = async (forceRefresh = false) => {
        // Tránh load nhiều lần đồng thời
        if (isLoadingRef.current) {
            console.log('⏸️ [HotDealsSection] Already loading, skipping...');
            return;
        }
        // Kiểm tra cache trước
        if (!forceRefresh) {
            const cached = getCache(CACHE_KEYS.HOT_DEALS);
            if (cached) {
                console.log('✅ [HotDealsSection] Using cached data');
                setAllHotDeals(cached);
                return;
            }
        }
        try {
            setLoading(true);
            isLoadingRef.current = true;
            // Load nhiều sản phẩm hơn để đảm bảo có đủ sau khi filter
            // Vì filter client-side (chỉ lấy sản phẩm có isSale), nên cần load nhiều hơn
            // Ước tính: nếu 40 sản phẩm chỉ có 34 thỏa điều kiện (~85%), cần load ~47 sản phẩm
            // Để an toàn, load 100 sản phẩm để đảm bảo có đủ 40 sản phẩm thỏa điều kiện
            const result = await productApi.getAll({
                limit: 100, // Tăng limit để có đủ sản phẩm sau khi filter
            });
            // Filter và sort các sản phẩm có sale theo discount giảm dần
            const dealsWithDiscount = result.products
                .filter(p => p.isSale && p.originalPrice && p.originalPrice > p.price)
                .map(p => ({
                ...p,
                discount: calculateDiscount(p.originalPrice, p.price)
            }))
                .sort((a, b) => (b.discount || 0) - (a.discount || 0)) // Sort theo discount giảm dần
                .slice(0, 40); // Chỉ lấy 40 sản phẩm đầu tiên sau khi sort
            console.log(`🔥 [HotDealsSection] Loaded ${result.products.length} products, filtered to ${dealsWithDiscount.length} hot deals`);
            // Lưu vào cache (TTL: 5 phút)
            setCache(CACHE_KEYS.HOT_DEALS, dealsWithDiscount, 5 * 60 * 1000);
            setAllHotDeals(dealsWithDiscount);
        }
        catch (error) {
            console.error('Failed to load hot deals:', error);
            // Thử dùng cache cũ nếu có lỗi
            const cached = getCache(CACHE_KEYS.HOT_DEALS);
            if (cached) {
                console.log('⚠️ [HotDealsSection] Using stale cache due to error');
                setAllHotDeals(cached);
            }
            else {
                toast.error('Không thể tải sản phẩm hot deals');
                setAllHotDeals([]);
            }
        }
        finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };
    // Lấy sản phẩm để hiển thị: 8 sản phẩm khi collapse, 72 sản phẩm (9 hàng x 8) khi expand
    const displayedProducts = isExpanded
        ? allHotDeals.slice(0, 72) // 9 hàng x 8 cột = 72 sản phẩm
        : allHotDeals.slice(0, 8); // 1 hàng x 8 cột = 8 sản phẩm
    // Mock hot deals products (fallback)
    const mockHotDeals = [
        {
            id: 'hot-1',
            name: 'iPhone 15 Pro Max 256GB',
            price: 28990000,
            originalPrice: 34990000,
            discount: 17,
            image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500',
            category: 'electronics',
            rating: 4.9,
            reviews: 2543,
            description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ',
            brand: 'Apple',
            inStock: true,
            isBestSeller: true,
            timeLeft: '2 giờ 15 phút'
        },
        {
            id: 'hot-2',
            name: 'Samsung Galaxy S24 Ultra 512GB',
            price: 29990000,
            originalPrice: 35990000,
            discount: 17,
            image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
            category: 'electronics',
            rating: 4.8,
            reviews: 1876,
            description: 'Galaxy S24 Ultra với camera 200MP',
            brand: 'Samsung',
            inStock: true,
            isBestSeller: true,
            timeLeft: '3 giờ 42 phút'
        },
        {
            id: 'hot-3',
            name: 'MacBook Air M3 15 inch 256GB',
            price: 32990000,
            originalPrice: 39990000,
            discount: 18,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            category: 'electronics',
            rating: 4.9,
            reviews: 3214,
            description: 'MacBook Air M3 siêu mỏng nhẹ',
            brand: 'Apple',
            inStock: true,
            isBestSeller: true,
            timeLeft: '5 giờ 20 phút'
        },
        {
            id: 'hot-4',
            name: 'Sony WH-1000XM5 Chống ồn',
            price: 6990000,
            originalPrice: 8990000,
            discount: 22,
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
            category: 'electronics',
            rating: 4.8,
            reviews: 1543,
            description: 'Tai nghe chống ồn hàng đầu',
            brand: 'Sony',
            inStock: true,
            isBestSeller: true,
            timeLeft: '1 giờ 35 phút'
        }
    ];
    const handleAddToCart = (product, e) => {
        e.stopPropagation(); // Ngăn không cho trigger xem chi tiết
        if (!isLoggedIn) {
            e.preventDefault();
            onLogin?.();
            return;
        }
        onAddToCart(product);
        if (onTriggerFlyingIcon) {
            onTriggerFlyingIcon('cart', e.currentTarget);
        }
    };
    const handleBuyNow = (product, e) => {
        e.stopPropagation(); // Ngăn không cho trigger xem chi tiết
        if (!isLoggedIn) {
            e.preventDefault();
            onLogin?.();
            return;
        }
        // Convert product to CartItem
        const cartItem = {
            ...product,
            quantity: 1,
            selected: true,
        };
        // Navigate to checkout with product
        navigate('/checkout', {
            state: {
                items: [cartItem],
            },
        });
    };
    // Handler để xem chi tiết sản phẩm khi click vào card
    const handleCardClick = (product) => {
        onViewDetail(product);
    };
    return (_jsx("section", { className: "py-12 bg-gradient-to-b from-muted/30 to-background", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { ref: sectionHeaderRef, className: "flex items-center justify-between mb-8", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center", children: _jsx(Flame, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold", children: "Flash Sale H\u00F4m Nay" }), _jsx("p", { className: "text-muted-foreground", children: "Gi\u1EA3m gi\u00E1 c\u1EF1c s\u1ED1c, s\u1ED1 l\u01B0\u1EE3ng c\u00F3 h\u1EA1n" })] })] }), _jsxs("div", { className: "hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full", children: [_jsx(Clock, { className: "w-5 h-5 animate-pulse" }), _jsx("span", { className: "font-bold", children: "K\u1EBFt th\u00FAc sau: 05:42:18" })] })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2", children: displayedProducts.map((product) => (_jsxs("div", { className: "group relative bg-card border border-border rounded-md overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer", onClick: () => handleCardClick(product), children: [_jsxs("div", { className: "absolute top-1 left-1 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-md", children: ["-", product.discount || calculateDiscount(product.originalPrice || 0, product.price), "%"] }), product.timeLeft && (_jsxs("div", { className: "absolute top-1 right-1 z-10 bg-black/70 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[10px] flex items-center gap-0.5", children: [_jsx(Clock, { className: "w-2 h-2" }), _jsx("span", { className: "text-[10px]", children: product.timeLeft })] })), _jsx("div", { className: "relative aspect-square overflow-hidden bg-muted", children: _jsx(ImageWithFallback, { src: product.image, alt: product.name, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" }) }), _jsxs("div", { className: "p-1.5 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-1 flex-wrap", children: [_jsx(Badge, { variant: "outline", className: "text-[10px] px-1 py-0 h-4", children: product.brand }), product.isBestSeller && (_jsx(Badge, { className: "text-[10px] bg-yellow-500/10 text-yellow-700 border-yellow-500/20 px-1 py-0 h-4", children: "B\u00E1n ch\u1EA1y" }))] }), _jsx("h3", { className: "font-medium line-clamp-2 text-xs min-h-[2rem] leading-tight", children: product.name }), _jsxs("div", { className: "flex items-center gap-1 text-[10px]", children: [_jsxs("div", { className: "flex items-center gap-0.5", children: [_jsx("span", { className: "text-yellow-500 text-[10px]", children: "\u2605" }), _jsx("span", { className: "font-medium text-[10px]", children: product.rating })] }), _jsxs("span", { className: "text-muted-foreground text-[10px]", children: ["(", product.reviews > 999 ? '999+' : product.reviews, ")"] })] }), _jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "flex items-baseline gap-1", children: _jsxs("span", { className: "text-sm font-bold text-red-500", children: [product.price.toLocaleString('vi-VN'), "\u20AB"] }) }), product.originalPrice && (_jsx("div", { className: "flex items-center gap-1", children: _jsxs("span", { className: "text-[10px] text-muted-foreground line-through", children: [product.originalPrice.toLocaleString('vi-VN'), "\u20AB"] }) }))] }), _jsxs("div", { className: "space-y-0.5", children: [_jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [_jsx("span", { children: "\u0110\u00E3 b\u00E1n" }), _jsx("span", { children: "234" })] }), _jsx("div", { className: "h-1 bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full", style: { width: '78%' } }) })] }), _jsxs(Button, { className: "w-full gap-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-[10px] h-6 px-1", onClick: (e) => handleBuyNow(product, e), disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-2.5 h-2.5" }), _jsx("span", { className: "text-[10px]", children: "Mua ngay" })] })] })] }, product.id))) }), _jsx("div", { className: "flex justify-center mt-8", children: _jsx(Button, { variant: "outline", size: "lg", className: "gap-2", onClick: () => {
                            const wasExpanded = isExpanded;
                            setIsExpanded(!isExpanded);
                            // Nếu đang thu gọn (từ expanded về collapsed), cuộn lên header
                            if (wasExpanded && sectionHeaderRef.current) {
                                setTimeout(() => {
                                    const headerOffset = 80; // Offset cho fixed header
                                    const elementPosition = sectionHeaderRef.current?.getBoundingClientRect().top;
                                    const offsetPosition = (elementPosition || 0) + window.pageYOffset - headerOffset;
                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });
                                }, 100); // Delay nhỏ để state update xong
                            }
                        }, children: isExpanded ? (_jsxs(_Fragment, { children: ["Thu g\u1ECDn", _jsx(Flame, { className: "w-4 h-4" })] })) : (_jsxs(_Fragment, { children: ["Xem t\u1EA5t c\u1EA3 Flash Sale", _jsx(Flame, { className: "w-4 h-4" })] })) }) })] }) }));
}
