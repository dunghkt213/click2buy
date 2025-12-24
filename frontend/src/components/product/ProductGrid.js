import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Grid, List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { productApi } from '../../apis/product';
import { getCache, setCache } from '../../utils/cache';
import { Button } from '../ui/button';
import { ProductCard } from './ProductCard';
export function ProductGrid({ filters, onAddToCart, searchQuery = '', onViewDetail, onTriggerFlyingIcon, isLoggedIn = false, onLogin, }) {
    const [viewMode, setViewMode] = useState('grid');
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productGridRef = useRef(null);
    const isLoadingRef = useRef(false);
    // Motion variants
    const motionEase = [0.4, 0, 0.2, 1];
    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } },
    };
    // Fetch products từ backend với pagination và cache
    const fetchProducts = async (page = 1, forceRefresh = false) => {
        // Tránh fetch nhiều lần đồng thời
        if (isLoadingRef.current) {
            console.log('⏸️ [ProductGrid] Already fetching, skipping...');
            return;
        }
        // Build cache key với tất cả filters để cache riêng cho mỗi bộ filter
        const selectedCategoryId = filters.category && filters.category !== 'all' ? filters.category : undefined;
        const filtersKey = JSON.stringify({
            categoryId: selectedCategoryId,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            brands: filters.brands,
            rating: filters.rating,
            inStock: filters.inStock,
            search: searchQuery,
        });
        const cacheKey = `products_page_${page}_${filtersKey}`;
        // Kiểm tra cache trước (chỉ khi không force refresh)
        if (!forceRefresh) {
            const cached = getCache(cacheKey);
            if (cached) {
                console.log('✅ [ProductGrid] Using cached data');
                setAllProducts(cached.products);
                if (cached.pagination) {
                    setCurrentPage(cached.pagination.page || page);
                    setTotalPages(cached.pagination.totalPages || 1);
                    setTotalProducts(cached.pagination.total || cached.products.length);
                }
                return;
            }
        }
        setLoading(true);
        isLoadingRef.current = true;
        try {
            // Build query với tất cả filters
            const queryParams = {
                page,
                limit: 40
            };
            if (selectedCategoryId) {
                queryParams.categoryId = selectedCategoryId;
            }
            // Thêm các filters vào query params
            if (filters.priceRange[0] > 0) {
                queryParams.minPrice = filters.priceRange[0];
            }
            if (filters.priceRange[1] < Number.MAX_SAFE_INTEGER) {
                queryParams.maxPrice = filters.priceRange[1];
            }
            if (filters.brands.length > 0) {
                // Backend có thể nhận brands dưới dạng array hoặc string
                queryParams.brands = filters.brands.join(',');
            }
            if (filters.rating > 0) {
                queryParams.rating = filters.rating;
            }
            if (filters.inStock) {
                queryParams.inStock = true;
            }
            if (searchQuery) {
                queryParams.search = searchQuery;
            }
            console.log('📦 [ProductGrid] Fetching products with query:', queryParams);
            const result = await productApi.getAll(queryParams);
            console.log('📦 [ProductGrid] API Response:', result);
            // Lưu vào cache (TTL: 5 phút) với key dựa trên filters
            const cacheData = {
                products: result.products,
                pagination: result.pagination,
            };
            setCache(cacheKey, cacheData, 5 * 60 * 1000);
            setAllProducts(result.products);
            if (result.pagination) {
                console.log('📦 [ProductGrid] Pagination info:', result.pagination);
                setCurrentPage(result.pagination.page || page);
                setTotalPages(result.pagination.totalPages || 1);
                setTotalProducts(result.pagination.total || result.products.length);
            }
            else {
                // Fallback: Tính toán từ số lượng sản phẩm
                // Nếu có đúng 40 sản phẩm, có thể còn trang tiếp theo
                const hasMore = result.products.length === 40;
                const estimatedPages = hasMore ? page + 1 : page;
                console.log('⚠️ [ProductGrid] No pagination info, using fallback:', {
                    productsCount: result.products.length,
                    currentPage: page,
                    estimatedPages
                });
                setCurrentPage(page);
                setTotalPages(estimatedPages);
                setTotalProducts(result.products.length * estimatedPages);
            }
            // Scroll đến phần hiển thị sản phẩm khi đổi trang
            if (productGridRef.current) {
                const headerOffset = 80; // Offset cho fixed header
                const elementPosition = productGridRef.current.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        }
        catch (err) {
            console.error('❌ [ProductGrid] Error:', err);
            // Thử dùng cache cũ nếu có lỗi
            const cached = getCache(cacheKey);
            if (cached) {
                console.log('⚠️ [ProductGrid] Using stale cache due to error');
                setAllProducts(cached.products);
                if (cached.pagination) {
                    setCurrentPage(cached.pagination.page || page);
                    setTotalPages(cached.pagination.totalPages || 1);
                    setTotalProducts(cached.pagination.total || cached.products.length);
                }
            }
            else {
                toast.error('Không thể tải sản phẩm từ server');
                setAllProducts([]);
                setCurrentPage(1);
                setTotalPages(1);
                setTotalProducts(0);
            }
        }
        finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };
    // Fetch products khi component mount hoặc filters/searchQuery thay đổi
    useEffect(() => {
        // Reset về trang 1 khi filters thay đổi
        setCurrentPage(1);
        fetchProducts(1, true); // Force refresh khi filters thay đổi
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.category,
        filters.priceRange[0],
        filters.priceRange[1],
        filters.brands.join(','), // Convert array to string for comparison
        filters.rating,
        filters.inStock,
        searchQuery,
    ]);
    // Handle page change
    const handlePageChange = (page) => {
        console.log('🔄 [ProductGrid] Page change requested:', {
            requestedPage: page,
            currentPage,
            totalPages,
            isValid: page >= 1 && page <= totalPages && page !== currentPage
        });
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchProducts(page);
        }
    };
    const filteredProducts = allProducts.filter((product) => {
        if (filters.rating > 0) {
            const productRating = typeof product.rating === 'number'
                ? product.rating
                : product.ratingAvg;
            const normalized = typeof productRating === 'number' ? productRating : 0;
            if (normalized < filters.rating)
                return false;
        }
        return true;
    });
    return (_jsxs("div", { ref: productGridRef, className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "S\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-muted-foreground", children: loading
                                    ? 'Đang tải sản phẩm...'
                                    : totalProducts > 0
                                        ? `Hiển thị ${filteredProducts.length} / ${totalProducts} sản phẩm`
                                        : `Hiển thị ${filteredProducts.length} sản phẩm` })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: viewMode === 'grid' ? 'default' : 'outline', size: "sm", onClick: () => setViewMode('grid'), children: _jsx(Grid, { className: "w-4 h-4" }) }), _jsx(Button, { variant: viewMode === 'list' ? 'default' : 'outline', size: "sm", onClick: () => setViewMode('list'), children: _jsx(List, { className: "w-4 h-4" }) })] })] }), loading ? (_jsx("p", { className: "text-center py-16 text-muted-foreground", children: "\u0110ang t\u1EA3i s\u1EA3n ph\u1EA9m..." })) : filteredProducts.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsx(Filter, { className: "w-16 h-16 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y s\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-muted-foreground", children: "Th\u1EED \u0111i\u1EC1u ch\u1EC9nh b\u1ED9 l\u1ECDc \u0111\u1EC3 xem th\u00EAm s\u1EA3n ph\u1EA9m" })] })) : (_jsx(motion.div, { layout: true, variants: containerVariants, initial: "hidden", animate: "show", className: `grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`, children: filteredProducts.map((product) => (_jsx(motion.div, { variants: itemVariants, layout: true, children: _jsx(ProductCard, { product: product, onAddToCart: onAddToCart, viewMode: viewMode, onViewDetail: onViewDetail, onTriggerFlyingIcon: onTriggerFlyingIcon, isLoggedIn: isLoggedIn, onLogin: onLogin }) }, product.id))) })), !loading && (_jsx("div", { className: "flex flex-col items-center gap-4 mt-12 pt-8 border-t", children: _jsxs("div", { className: "flex items-center justify-center gap-2 flex-wrap", children: [_jsxs(Button, { variant: "outline", size: "default", onClick: () => {
                                console.log('👆 [ProductGrid] Previous clicked, currentPage:', currentPage);
                                handlePageChange(currentPage - 1);
                            }, disabled: currentPage <= 1, className: "gap-1 min-w-[100px]", children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Tr\u01B0\u1EDBc"] }), _jsx("div", { className: "flex items-center gap-1 flex-wrap justify-center", children: (() => {
                                const pages = [];
                                const maxVisible = 7;
                                if (totalPages <= maxVisible) {
                                    // Hiển thị tất cả nếu <= 7 trang
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i);
                                    }
                                }
                                else {
                                    // Luôn hiển thị trang đầu
                                    pages.push(1);
                                    if (currentPage <= 4) {
                                        // Ở đầu: 1, 2, 3, 4, 5, ..., totalPages
                                        for (let i = 2; i <= 5; i++) {
                                            pages.push(i);
                                        }
                                        pages.push('...');
                                        pages.push(totalPages);
                                    }
                                    else if (currentPage >= totalPages - 3) {
                                        // Ở cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
                                        pages.push('...');
                                        for (let i = totalPages - 4; i <= totalPages; i++) {
                                            pages.push(i);
                                        }
                                    }
                                    else {
                                        // Ở giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
                                        pages.push('...');
                                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                            pages.push(i);
                                        }
                                        pages.push('...');
                                        pages.push(totalPages);
                                    }
                                }
                                return pages.map((page, index) => {
                                    if (page === '...') {
                                        return (_jsx("span", { className: "px-3 py-2 text-muted-foreground font-medium", children: "..." }, `ellipsis-${index}`));
                                    }
                                    return (_jsx(Button, { variant: currentPage === page ? 'default' : 'outline', size: "default", onClick: () => {
                                            console.log('👆 [ProductGrid] Page number clicked:', page);
                                            handlePageChange(page);
                                        }, className: `min-w-[44px] h-10 font-medium ${currentPage === page
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'hover:bg-accent'}`, children: page }, page));
                                });
                            })() }), _jsxs(Button, { variant: "outline", size: "default", onClick: () => {
                                console.log('👆 [ProductGrid] Next clicked, currentPage:', currentPage, 'totalPages:', totalPages);
                                handlePageChange(currentPage + 1);
                            }, disabled: currentPage >= totalPages, className: "gap-1 min-w-[100px]", children: ["Sau", _jsx(ChevronRight, { className: "w-4 h-4" })] })] }) }))] }));
}
