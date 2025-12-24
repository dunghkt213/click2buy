import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ShopPage - Trang cửa hàng
 * Hiển thị thông tin shop, giới thiệu và các sản phẩm của shop
 */
import { Search, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { productApi } from '../../apis/product';
import { userApi } from '../../apis/user';
import { FlyingIcon } from '../../components/animation/FlyingIcon';
import { ProductCard } from '../../components/product/ProductCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { useAppContext } from '../../providers/AppProvider';
export function ShopPage() {
    const app = useAppContext();
    const [searchParams] = useSearchParams();
    const ownerId = searchParams.get('ownerId');
    const [shopInfo, setShopInfo] = useState(null);
    const [shopProducts, setShopProducts] = useState([]);
    const [loadingShop, setLoadingShop] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    // Load shop info từ API
    useEffect(() => {
        if (ownerId) {
            loadShopInfo(ownerId);
            loadShopProducts(ownerId);
        }
        else {
            toast.error('Không tìm thấy thông tin cửa hàng');
            setLoadingShop(false);
            setLoadingProducts(false);
        }
    }, [ownerId]);
    const loadShopInfo = async (id) => {
        try {
            setLoadingShop(true);
            const shop = await userApi.findOne(id);
            setShopInfo(shop);
        }
        catch (error) {
            console.error('Failed to load shop info:', error);
            toast.error('Không thể tải thông tin cửa hàng');
            setShopInfo(null);
        }
        finally {
            setLoadingShop(false);
        }
    };
    const loadShopProducts = async (id) => {
        try {
            setLoadingProducts(true);
            // Load tất cả products và filter theo ownerId
            const result = await productApi.getAll({ limit: 1000 });
            const filtered = result.products.filter(p => (p.ownerId === id || p.sellerId === id));
            setShopProducts(filtered);
        }
        catch (error) {
            console.error('Failed to load shop products:', error);
            toast.error('Không thể tải sản phẩm của cửa hàng');
            setShopProducts([]);
        }
        finally {
            setLoadingProducts(false);
        }
    };
    // Scroll về đầu trang khi vào trang shop
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);
    // Filter products based on search
    const filteredProducts = shopProducts.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    // Loading state
    if (loadingShop) {
        return (_jsx("main", { className: "min-h-screen pt-16 bg-background", children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i th\u00F4ng tin c\u1EEDa h\u00E0ng..." })] }) }) }) }));
    }
    // Error state - no shop info
    if (!shopInfo) {
        return (_jsx("main", { className: "min-h-screen pt-16 bg-background", children: _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Store, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y c\u1EEDa h\u00E0ng" }), _jsx("p", { className: "text-muted-foreground", children: "Kh\u00F4ng th\u1EC3 t\u1EA3i th\u00F4ng tin c\u1EEDa h\u00E0ng. Vui l\u00F2ng th\u1EED l\u1EA1i sau." })] }) }) }) }));
    }
    return (_jsxs("main", { className: "min-h-screen pt-16 bg-background", children: [_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsx(Card, { className: "p-6 mb-8", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsxs("div", { className: "flex flex-col items-center md:items-start", children: [_jsxs("div", { className: "relative mb-4", children: [_jsx("img", { src: shopInfo.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shopInfo.shopName || shopInfo.username || 'Shop') + '&background=0ea5e9&color=fff&size=128', alt: shopInfo.shopName || shopInfo.username || 'Shop', className: "w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg", onError: (e) => {
                                                        const target = e.target;
                                                        target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shopInfo.shopName || shopInfo.username || 'Shop') + '&background=0ea5e9&color=fff&size=128';
                                                    } }), _jsx("div", { className: "absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background", children: _jsx(Store, { className: "w-5 h-5 text-primary-foreground" }) })] }), _jsx("h1", { className: "text-2xl font-bold mb-2 text-center md:text-left", children: shopInfo.shopName || shopInfo.username || 'Cửa hàng' }), _jsx("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: _jsxs("span", { className: "text-sm text-muted-foreground", children: [shopProducts.length, " s\u1EA3n ph\u1EA9m"] }) }), shopInfo.role === 'seller' && (_jsx(Badge, { variant: "secondary", className: "w-fit", children: "\u0110\u00E3 x\u00E1c th\u1EF1c" }))] }), _jsxs("div", { className: "flex-1 space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Gi\u1EDBi thi\u1EC7u c\u1EEDa h\u00E0ng" }), _jsx("p", { className: "text-muted-foreground leading-relaxed", children: shopInfo.shopDescription || 'Chưa có mô tả cửa hàng.' })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [shopInfo.shopAddress && (_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "\u0110\u1ECBa ch\u1EC9:" }), _jsx("p", { className: "font-medium mt-1", children: shopInfo.shopAddress })] })), (shopInfo.shopPhone || shopInfo.phone) && (_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Li\u00EAn h\u1EC7:" }), _jsx("p", { className: "font-medium mt-1", children: shopInfo.shopPhone || shopInfo.phone })] })), (shopInfo.shopEmail || shopInfo.email) && (_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Email:" }), _jsx("p", { className: "font-medium mt-1", children: shopInfo.shopEmail || shopInfo.email })] })), shopInfo.createdAt && (_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Tham gia:" }), _jsx("p", { className: "font-medium mt-1", children: new Date(shopInfo.createdAt).toLocaleDateString('vi-VN') })] }))] })] })] }) }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm ki\u1EBFm s\u1EA3n ph\u1EA9m trong c\u1EEDa h\u00E0ng...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10 h-12 text-base" }), searchQuery && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSearchQuery(''), className: "absolute right-2 top-1/2 transform -translate-y-1/2", children: "X\u00F3a" }))] }), searchQuery && (_jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: ["T\u00ECm th\u1EA5y ", filteredProducts.length, " s\u1EA3n ph\u1EA9m cho \"", searchQuery, "\""] }))] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "S\u1EA3n ph\u1EA9m c\u1EE7a c\u1EEDa h\u00E0ng" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [filteredProducts.length, " s\u1EA3n ph\u1EA9m"] })] }), loadingProducts ? (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i s\u1EA3n ph\u1EA9m..." })] }) })) : filteredProducts.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Search, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm' }), _jsx("p", { className: "text-muted-foreground mb-4", children: searchQuery
                                                ? `Không có sản phẩm nào khớp với từ khóa "${searchQuery}"`
                                                : 'Cửa hàng này chưa có sản phẩm nào.' }), searchQuery && (_jsx(Button, { variant: "outline", onClick: () => setSearchQuery(''), children: "X\u00F3a b\u1ED9 l\u1ECDc" }))] }) })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: filteredProducts.map((product) => (_jsx(ProductCard, { product: product, onAddToCart: app.addToCart, onViewDetail: app.handleViewProductDetail, onTriggerFlyingIcon: app.handleTriggerFlyingIcon, isLoggedIn: app.isLoggedIn, onLogin: app.handleLogin }, product.id))) }))] })] }), app.flyingIcons && app.flyingIcons.length > 0 && (_jsx(FlyingIcon, { icons: app.flyingIcons, onComplete: app.handleAnimationComplete }))] }));
}
