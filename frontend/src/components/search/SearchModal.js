import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { productApi } from '../../apis/product';
import { FlyingIcon } from '../animation/FlyingIcon';
import { Footer } from '../layout/Footer';
import { Header } from '../layout/Header';
import { ProductCard } from '../product/ProductCard';
import { FilterSidebar } from '../sidebars/FilterSidebar';
import { Button } from '../ui/button';
export function SearchModal({ isOpen, onClose, onAddToCart, initialSearchQuery = '', cartItemsCount, unreadNotifications, onCartClick, onNotificationsClick, onPromotionClick, onSupportClick, isLoggedIn, user, onLogin, onRegister, onLogout, onProfileClick, onOrdersClick, onViewDetail, // THÊM
onTriggerFlyingIcon, // THÊM
onStoreClick, // THÊM
onLogoClick, // THÊM
cartItems, // THÊM
totalPrice, // THÊM
cartIconRef, // THÊM
flyingIcons = [], // THÊM
onAnimationComplete, // THÊM
 }) {
    const [inputValue, setInputValue] = useState(''); // Giá trị tạm trong input
    const [searchQuery, setSearchQuery] = useState(''); // Giá trị thực tế để filter
    const [filters, setFilters] = useState({
        category: 'all',
        priceRange: [0, 50000000],
        brands: [],
        rating: 0,
        inStock: true,
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    // Cập nhật cả input value và search query khi modal mở với query từ Header
    useEffect(() => {
        if (isOpen && initialSearchQuery) {
            setInputValue(initialSearchQuery);
            setSearchQuery(initialSearchQuery);
        }
    }, [isOpen, initialSearchQuery]);
    // Load products từ API khi search query thay đổi
    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen, searchQuery, filters]);
    const loadProducts = async () => {
        try {
            setLoading(true);
            console.log('🔍 [SearchModal] Bắt đầu tìm kiếm với keyword:', searchQuery);
            console.log('🔍 [SearchModal] Filters:', filters);
            const searchParams = {
                keyword: searchQuery || undefined,
                category: filters.category !== 'all' ? filters.category : undefined,
                minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
                maxPrice: filters.priceRange[1] < 50000000 ? filters.priceRange[1] : undefined,
                rating: filters.rating > 0 ? filters.rating : undefined,
            };
            console.log('🔍 [SearchModal] Gọi API search với params:', searchParams);
            const products = await productApi.search(searchParams);
            console.log('✅ [SearchModal] API search trả về:', products);
            console.log('✅ [SearchModal] Số lượng sản phẩm:', products?.length || 0);
            setAllProducts(products);
            if (products && products.length > 0) {
                console.log('✅ [SearchModal] Đã tải thành công', products.length, 'sản phẩm');
            }
            else {
                console.log('⚠️ [SearchModal] Không tìm thấy sản phẩm nào');
            }
        }
        catch (error) {
            console.error('❌ [SearchModal] Lỗi khi tìm kiếm:', error);
            console.error('❌ [SearchModal] Error details:', error.message, error.stack);
            toast.error('Không thể tải sản phẩm');
            setAllProducts([]);
        }
        finally {
            setLoading(false);
        }
    };
    // Mock products data (fallback nếu API fail)
    const mockProducts = [
        {
            id: '1',
            name: 'Áo Sơ Mi Công Sở Nam',
            price: 399000,
            originalPrice: 599000,
            image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBhcHBhcmVsfGVufDF8fHx8MTc1ODA4NDQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'fashion',
            rating: 4.5,
            reviews: 324,
            description: 'Áo sơ mi cao cấp, chất liệu cotton 100%, form dáng chuẩn.',
            brand: 'Aristino',
            inStock: true,
            isNew: true,
            isSale: true,
        },
        {
            id: '2',
            name: 'iPhone 15 Pro Max',
            price: 29990000,
            originalPrice: 32990000,
            image: 'https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3B8ZW58MXx8fHwxNzU4MDY2MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'electronics',
            rating: 4.8,
            reviews: 1250,
            description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ và camera 48MP chuyên nghiệp.',
            brand: 'Apple',
            inStock: true,
            isNew: true,
            isSale: true,
        },
        {
            id: '3',
            name: 'Ghế Sofa Phòng Khách',
            price: 8500000,
            originalPrice: 12000000,
            image: 'https://images.unsplash.com/photo-1652434819585-80051d62d9a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZnVybml0dXJlJTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3NTgwMzE5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'home',
            rating: 4.6,
            reviews: 189,
            description: 'Ghế sofa 3 chỗ ngồi, chất liệu da cao cấp, thiết kế hiện đại.',
            brand: 'IKEA',
            inStock: true,
            isSale: true,
        },
        {
            id: '4',
            name: 'Sách Dạy Nấu n Cơ Bản',
            price: 149000,
            originalPrice: 199000,
            image: 'https://images.unsplash.com/photo-1595315343110-9b445a960442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMGVkdWNhdGlvbiUyMHN0dWR5fGVufDF8fHx8MTc1ODA0ODQ4OXww&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'books',
            rating: 4.7,
            reviews: 567,
            description: 'Hướng dẫn nấu ăn từ cơ bản đến nâng cao, hình ảnh minh họa chi tiết.',
            brand: 'NXB Trẻ',
            inStock: true,
            isSale: true,
        },
        {
            id: '5',
            name: 'Tạ Tay Tập Gym 5kg',
            price: 299000,
            image: 'https://images.unsplash.com/photo-1710814824560-943273e8577e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBmaXRuZXNzJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1ODA1MTc5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'sports',
            rating: 4.4,
            reviews: 234,
            description: 'Tạ tay thép phủ cao su, grip chống trượt, phù hợp tập luyện tại nhà.',
            brand: 'Adidas',
            inStock: true,
        },
        {
            id: '6',
            name: 'Kem Dưỡng Da Mặt',
            price: 450000,
            originalPrice: 650000,
            image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'beauty',
            rating: 4.8,
            reviews: 892,
            description: 'Kem dưỡng ẩm chuyên sâu với vitamin C, phù hợp mọi loại da.',
            brand: 'L\'Oreal',
            inStock: true,
            isSale: true,
        },
        {
            id: '10',
            name: 'Laptop Gaming ASUS ROG',
            price: 35990000,
            image: 'https://images.unsplash.com/photo-1722159475082-0a2331580de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3NwYWNlJTIwc2V0dXB8ZW58MXx8fHwxNzU4MDUwMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'electronics',
            rating: 4.9,
            reviews: 156,
            description: 'Laptop gaming RTX 4060, Intel Core i7, RAM 16GB, SSD 512GB.',
            brand: 'ASUS',
            inStock: true,
            isNew: true,
        },
        {
            id: '12',
            name: 'Serum Vitamin C Chống Lão Hóa',
            price: 890000,
            originalPrice: 1290000,
            image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            category: 'beauty',
            rating: 4.8,
            reviews: 423,
            description: 'Serum vitamin C 20%, giúp làm sáng da và chống lão hóa hiệu quả.',
            brand: 'The Ordinary',
            inStock: true,
            isSale: true,
        },
    ];
    // Filter products based on filters (client-side filter cho các filter còn lại)
    // Note: Search, category, price, rating đã được filter ở API level
    const filteredProducts = allProducts.filter(product => {
        // Brand filter
        const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
        // Stock filter
        const matchesStock = !filters.inStock || product.inStock;
        return matchesBrand && matchesStock;
    });
    // Handle search input change
    const handleSearchInputChange = (value) => {
        setInputValue(value);
    };
    // Handle search input submit - reload trang search với query mới
    const handleSearchInputSubmit = () => {
        if (inputValue.trim()) {
            // Reload trang search với query mới
            window.location.href = `/search?q=${encodeURIComponent(inputValue.trim())}`;
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(Header, { cartItemsCount: cartItemsCount, unreadNotifications: unreadNotifications, onCartClick: onCartClick, onNotificationsClick: onNotificationsClick, onFilterClick: () => setIsFilterOpen(true), onPromotionClick: onPromotionClick, onSupportClick: onSupportClick, onStoreClick: onStoreClick || (() => { }), onLogoClick: onLogoClick || (() => { }), isLoggedIn: isLoggedIn, user: user, onLogin: onLogin, onRegister: onRegister, onLogout: onLogout, onProfileClick: onProfileClick, onOrdersClick: onOrdersClick, searchQuery: inputValue, onSearchChange: handleSearchInputChange, onSearchClick: handleSearchInputSubmit, cartItems: cartItems, totalPrice: totalPrice, cartIconRef: cartIconRef }), _jsxs("main", { className: "pt-16", children: [_jsx("div", { className: "border-b border-border bg-card/50 backdrop-blur-md py-6", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl", children: searchQuery.trim() ? `Kết quả tìm kiếm "${searchQuery}"` : 'Tìm kiếm sản phẩm' }), _jsx("p", { className: "text-muted-foreground text-sm mt-1", children: searchQuery.trim() ? `Tìm thấy ${filteredProducts.length} sản phẩm` : 'Nhập từ khóa vào ô tìm kiếm phía trên' })] }), _jsxs(Button, { variant: "outline", onClick: onClose, className: "gap-2", children: [_jsx(X, { className: "w-4 h-4" }), "\u0110\u00F3ng t\u00ECm ki\u1EBFm"] })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "flex gap-8", children: [_jsx(FilterSidebar, { isOpen: isFilterOpen, onClose: () => setIsFilterOpen(false), filters: filters, onFiltersChange: setFilters }), _jsx("div", { className: "flex-1", children: !searchQuery.trim() ? (_jsxs("div", { className: "text-center py-16", children: [_jsx(Search, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "mb-2", children: "B\u1EAFt \u0111\u1EA7u t\u00ECm ki\u1EBFm" }), _jsx("p", { className: "text-muted-foreground text-sm", children: "Nh\u1EADp t\u00EAn s\u1EA3n ph\u1EA9m, th\u01B0\u01A1ng hi\u1EC7u ho\u1EB7c t\u1EEB kh\u00F3a \u1EDF \u00F4 t\u00ECm ki\u1EBFm ph\u00EDa tr\u00EAn" })] })) : filteredProducts.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsx(Search, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y s\u1EA3n ph\u1EA9m" }), _jsxs("p", { className: "text-muted-foreground text-sm", children: ["Kh\u00F4ng t\u00ECm th\u1EA5y s\u1EA3n ph\u1EA9m n\u00E0o ph\u00F9 h\u1EE3p v\u1EDBi \"", searchQuery, "\""] }), _jsx("p", { className: "text-muted-foreground text-sm mt-2", children: "Th\u1EED t\u00ECm ki\u1EBFm v\u1EDBi t\u1EEB kh\u00F3a kh\u00E1c ho\u1EB7c \u0111i\u1EC1u ch\u1EC9nh b\u1ED9 l\u1ECDc" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: filteredProducts.map((product) => (_jsx(ProductCard, { product: product, onAddToCart: onAddToCart, viewMode: "grid", onViewDetail: onViewDetail, onTriggerFlyingIcon: onTriggerFlyingIcon, isLoggedIn: isLoggedIn, onLogin: onLogin }, product.id))) })) })] }) })] }), _jsx(Footer, {}), flyingIcons && flyingIcons.length > 0 && onAnimationComplete && (_jsx(FlyingIcon, { icons: flyingIcons, onComplete: onAnimationComplete }))] }));
}
