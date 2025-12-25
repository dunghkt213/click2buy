import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ProductDetailPage - Trang chi tiết sản phẩm
 * Hiển thị đầy đủ thông tin sản phẩm, shop, mô tả, đánh giá và sản phẩm liên quan
 */
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Package, Reply, Share2, Shield, ShoppingCart, Sparkles, Star, Store, ThumbsUp, TruckIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { productApi } from '../../apis/product';
import { mapReviewResponse, reviewApi } from '../../apis/review';
import { userApi } from '../../apis/user';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { ProductCard } from '../../components/product/ProductCard';
import { Avatar } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { useAppContext } from '../../providers/AppProvider';
const REVIEWS_PER_PAGE = 5;
export function ProductDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const app = useAppContext();
    const reviewSectionRef = useRef(null);
    const reviewItemRefs = useRef({});
    const pendingScrollReviewIdRef = useRef(null);
    const hasAutoScrolledToReviewSectionRef = useRef(false);
    const scrollIntervalRef = useRef(null);
    const hasAutoOpenedReplyEditorRef = useRef(false);
    const hasAutoExpandedSellerReplyRef = useRef(false);
    const replyTextareaRef = useRef(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [shopInfo, setShopInfo] = useState(null);
    const [loadingShop, setLoadingShop] = useState(false);
    const [shopProducts, setShopProducts] = useState([]);
    const [loadingShopProducts, setLoadingShopProducts] = useState(false);
    // Review pagination & filter
    const [reviewPage, setReviewPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null);
    const [sellerRepliesByReviewId, setSellerRepliesByReviewId] = useState({});
    const [replyDraftsByReviewId, setReplyDraftsByReviewId] = useState({});
    const [replyEditorReviewId, setReplyEditorReviewId] = useState(null);
    const [expandedSellerReplyByReviewId, setExpandedSellerReplyByReviewId] = useState({});
    const [sendingSellerReplyReviewId, setSendingSellerReplyReviewId] = useState(null);
    function clearSavedScrollPositionForPath(pathname) {
        try {
            const stored = sessionStorage.getItem('scrollPositions');
            if (!stored)
                return;
            const positions = JSON.parse(stored);
            if (positions && typeof positions === 'object') {
                delete positions[pathname];
                sessionStorage.setItem('scrollPositions', JSON.stringify(positions));
            }
        }
        catch {
            return;
        }
    }
    // Load product khi page mount
    // Không scroll về đầu trang nữa, để useScrollRestoration xử lý
    useEffect(() => {
        if (id) {
            const params = new URLSearchParams(location.search);
            const reviewIdFromQuery = params.get('reviewId');
            clearSavedScrollPositionForPath(location.pathname);
            // If navigating from a notification to a specific review, avoid forcing scroll-to-top,
            // because it can override the later scroll-to-review behavior.
            let timeoutId = null;
            if (!reviewIdFromQuery) {
                window.scrollTo({ top: 0, behavior: 'auto' });
                timeoutId = setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                }, 150);
            }
            loadProduct();
            return () => {
                if (timeoutId)
                    clearTimeout(timeoutId);
            };
        }
        else {
            toast.error('Không tìm thấy sản phẩm');
            navigate('/feed');
        }
    }, [id, location.pathname, location.search]);
    const targetReviewId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get('reviewId');
        return value && value.trim() ? value.trim() : null;
    }, [location.search]);
    const focusReview = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get('focusReview');
        return value === '1' || value === 'true';
    }, [location.search]);
    const shouldAutoOpenReplyEditor = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get('openReply');
        return value === '1' || value === 'true';
    }, [location.search]);
    const isFocusReviewMode = !!focusReview && !!targetReviewId;
    const isProductOwner = !!app.user?.id && !!product?.ownerId && product.ownerId === app.user.id;
    const scrollToElementWithOffset = (el, align) => {
        const headerOffset = 80;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        const top = align === 'center'
            ? elementTop - headerOffset - (window.innerHeight / 2) + (rect.height / 2)
            : elementTop - headerOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    };
    useEffect(() => {
        pendingScrollReviewIdRef.current = targetReviewId;
        hasAutoScrolledToReviewSectionRef.current = false;
        hasAutoOpenedReplyEditorRef.current = false;
        hasAutoExpandedSellerReplyRef.current = false;
    }, [id, targetReviewId]);
    useEffect(() => {
        if (!replyEditorReviewId)
            return;
        const timeoutId = setTimeout(() => {
            try {
                replyTextareaRef.current?.focus();
            }
            catch {
                // ignore
            }
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [replyEditorReviewId]);
    useEffect(() => {
        if (!targetReviewId)
            return;
        if (!product?.id)
            return;
        if (hasAutoScrolledToReviewSectionRef.current)
            return;
        if (!reviewSectionRef.current)
            return;
        hasAutoScrolledToReviewSectionRef.current = true;
        const timeoutId = setTimeout(() => {
            try {
                if (reviewSectionRef.current) {
                    scrollToElementWithOffset(reviewSectionRef.current, 'start');
                }
            }
            catch {
                // ignore
            }
        }, 250);
        return () => clearTimeout(timeoutId);
    }, [targetReviewId, product?.id]);
    // Load reviews và shop info khi có product
    useEffect(() => {
        if (product?.id) {
            loadReviews();
            loadShopInfo();
            loadShopProducts();
        }
    }, [product?.id, product?.ownerId, product?.sellerId]);
    const loadProduct = async () => {
        if (!id)
            return;
        try {
            setLoading(true);
            const data = await productApi.getById(id);
            setProduct(data);
        }
        catch (error) {
            console.error('Failed to load product:', error);
            toast.error('Không thể tải thông tin sản phẩm');
            navigate('/feed');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!targetReviewId)
            return;
        if (loadingReviews)
            return;
        if (!reviews || reviews.length === 0)
            return;
        // Ensure the target review is visible regardless of current filters/pagination
        const idx = reviews.findIndex((r) => r.id === targetReviewId);
        if (idx < 0)
            return;
        if (selectedRating !== null) {
            setSelectedRating(null);
        }
        const desiredPage = Math.floor(idx / REVIEWS_PER_PAGE) + 1;
        if (reviewPage !== desiredPage) {
            setReviewPage(desiredPage);
        }
        pendingScrollReviewIdRef.current = targetReviewId;
    }, [targetReviewId, loadingReviews, reviews, reviewPage, selectedRating]);
    useEffect(() => {
        const reviewId = pendingScrollReviewIdRef.current;
        if (!reviewId)
            return;
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
        let attempts = 0;
        scrollIntervalRef.current = setInterval(() => {
            attempts += 1;
            const el = reviewItemRefs.current[reviewId];
            if (el) {
                try {
                    scrollToElementWithOffset(el, 'center');
                    setTimeout(() => {
                        try {
                            scrollToElementWithOffset(el, 'center');
                        }
                        catch {
                            // ignore
                        }
                    }, 150);
                }
                catch {
                    // ignore
                }
                pendingScrollReviewIdRef.current = null;
                if (scrollIntervalRef.current) {
                    clearInterval(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                }
                return;
            }
            if (attempts === 1 && reviewSectionRef.current) {
                try {
                    scrollToElementWithOffset(reviewSectionRef.current, 'start');
                }
                catch {
                    // ignore
                }
            }
            if (attempts >= 20) {
                pendingScrollReviewIdRef.current = null;
                if (scrollIntervalRef.current) {
                    clearInterval(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                }
            }
        }, 150);
        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };
    }, [reviewPage, selectedRating, reviews.length, targetReviewId]);
    const loadShopInfo = async () => {
        const shopId = product?.ownerId || product?.sellerId;
        if (!shopId) {
            setShopInfo(null);
            return;
        }
        try {
            setLoadingShop(true);
            const shop = await userApi.findOne(shopId);
            setShopInfo(shop);
        }
        catch (error) {
            console.error('Failed to load shop info:', error);
            setShopInfo(null);
        }
        finally {
            setLoadingShop(false);
        }
    };
    const loadShopProducts = async () => {
        const shopId = product?.ownerId || product?.sellerId;
        if (!shopId)
            return;
        try {
            setLoadingShopProducts(true);
            const result = await productApi.getAll({ limit: 1000 });
            const filtered = result.products.filter((p) => (p.ownerId === shopId || p.sellerId === shopId) && p.id !== product?.id);
            setShopProducts(filtered.slice(0, 12)); // Hiển thị tối đa 12 sản phẩm
        }
        catch (error) {
            console.error('Failed to load shop products:', error);
            setShopProducts([]);
        }
        finally {
            setLoadingShopProducts(false);
        }
    };
    const loadReviews = async () => {
        if (!product?.id)
            return;
        try {
            setLoadingReviews(true);
            const data = await reviewApi.findAll({ productId: product.id });
            const rawList = Array.isArray(data)
                ? data
                : data?.data
                    ? (Array.isArray(data.data) ? data.data : [data.data])
                    : data
                        ? [data]
                        : [];
            const mappedReviews = rawList.map(mapReviewResponse);
            setReviews(mappedReviews);
        }
        catch (error) {
            console.error('Failed to load reviews:', error);
            setReviews([]);
        }
        finally {
            setLoadingReviews(false);
        }
    };
    useEffect(() => {
        if (!targetReviewId)
            return;
        if (!shouldAutoOpenReplyEditor)
            return;
        if (!product?.id)
            return;
        if (!isProductOwner)
            return;
        if (loadingReviews)
            return;
        if (!reviews || reviews.length === 0)
            return;
        if (hasAutoOpenedReplyEditorRef.current)
            return;
        const exists = reviews.some((r) => r.id === targetReviewId);
        if (!exists)
            return;
        hasAutoOpenedReplyEditorRef.current = true;
        setExpandedSellerReplyByReviewId((prev) => ({
            ...prev,
            [targetReviewId]: true,
        }));
        openReplyEditor(targetReviewId);
    }, [targetReviewId, shouldAutoOpenReplyEditor, product?.id, isProductOwner, loadingReviews, reviews]);
    useEffect(() => {
        if (!isFocusReviewMode)
            return;
        if (!targetReviewId)
            return;
        if (loadingReviews)
            return;
        if (!reviews || reviews.length === 0)
            return;
        if (hasAutoExpandedSellerReplyRef.current)
            return;
        const target = reviews.find((r) => r.id === targetReviewId);
        if (!target)
            return;
        const localReply = sellerRepliesByReviewId[targetReviewId];
        const replyText = (localReply && localReply.trim())
            ? localReply.trim()
            : (target.replyBySeller && target.replyBySeller.trim())
                ? target.replyBySeller.trim()
                : '';
        if (!replyText)
            return;
        hasAutoExpandedSellerReplyRef.current = true;
        setExpandedSellerReplyByReviewId((prev) => ({
            ...prev,
            [targetReviewId]: true,
        }));
    }, [isFocusReviewMode, targetReviewId, loadingReviews, reviews, sellerRepliesByReviewId]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "\u0110ang t\u1EA3i s\u1EA3n ph\u1EA9m..." })] }) }));
    }
    if (!product) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Package, { className: "w-24 h-24 mx-auto mb-4 text-muted-foreground/50" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Kh\u00F4ng t\u00ECm th\u1EA5y s\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "S\u1EA3n ph\u1EA9m b\u1EA1n \u0111ang t\u00ECm kh\u00F4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\u00E3 b\u1ECB x\u00F3a." }), _jsx(Button, { onClick: () => navigate('/feed'), children: "Quay l\u1EA1i trang ch\u1EE7" })] }) }) }));
    }
    const productImages = product.images || (product.image ? [product.image] : []);
    // Ưu tiên reservedStock (số đã bán từ backend), sau đó mới đến soldCount
    const soldCount = product.reservedStock ?? product.soldCount ?? 0;
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    // Filter reviews by rating
    const filteredReviews = selectedRating
        ? reviews.filter((r) => r.rating === selectedRating)
        : reviews;
    // Paginate reviews
    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = filteredReviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);
    const focusReviews = isFocusReviewMode
        ? filteredReviews.filter((r) => r.id === targetReviewId)
        : [];
    const displayedReviews = isFocusReviewMode ? focusReviews : paginatedReviews;
    const getSellerReplyForReview = (review) => {
        const localReply = sellerRepliesByReviewId[review.id];
        if (localReply && localReply.trim())
            return localReply;
        const backendReply = review.replyBySeller;
        if (backendReply && backendReply.trim())
            return backendReply;
        return '';
    };
    const toggleSellerReply = (reviewId) => {
        setExpandedSellerReplyByReviewId((prev) => ({
            ...prev,
            [reviewId]: !prev[reviewId],
        }));
    };
    function openReplyEditor(reviewId) {
        const review = reviews.find((r) => r.id === reviewId);
        setReplyEditorReviewId(reviewId);
        setReplyDraftsByReviewId((prev) => ({
            ...prev,
            [reviewId]: prev[reviewId] ?? sellerRepliesByReviewId[reviewId] ?? review?.replyBySeller ?? '',
        }));
    }
    const cancelReplyEditor = () => {
        setReplyEditorReviewId(null);
    };
    const saveSellerReply = async (reviewId) => {
        const content = (replyDraftsByReviewId[reviewId] || '').trim();
        if (!content) {
            toast.error('Vui lòng nhập nội dung trả lời');
            return;
        }
        try {
            setSendingSellerReplyReviewId(reviewId);
            const updated = await reviewApi.sellerReply(reviewId, { replyBySeller: content });
            setSellerRepliesByReviewId((prev) => ({
                ...prev,
                [reviewId]: content,
            }));
            setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, replyBySeller: updated?.replyBySeller ?? content } : r)));
            setReplyEditorReviewId(null);
            setExpandedSellerReplyByReviewId((prev) => ({
                ...prev,
                [reviewId]: true,
            }));
            toast.success('Đã gửi phản hồi');
        }
        catch (error) {
            console.error('Failed to send seller reply:', error);
            toast.error('Không thể gửi phản hồi');
        }
        finally {
            setSendingSellerReplyReviewId(null);
        }
    };
    // Rating breakdown
    const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => r.rating === stars).length;
        const total = reviews.length || 1;
        return {
            stars,
            count,
            percentage: Math.round((count / total) * 100),
        };
    });
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
    const handleAddToCart = (e) => {
        if (!app.isLoggedIn) {
            app.handleLogin();
            return;
        }
        if (app.handleTriggerFlyingIcon && e?.currentTarget) {
            app.handleTriggerFlyingIcon('cart', e.currentTarget);
        }
        for (let i = 0; i < quantity; i++) {
            app.addToCart(product);
        }
    };
    const handleBuyNow = () => {
        if (!app.isLoggedIn) {
            app.handleLogin();
            return;
        }
        if (!product)
            return;
        // Convert product to CartItem
        const cartItem = {
            ...product,
            quantity: quantity,
            selected: true,
        };
        // Navigate to checkout with product
        navigate('/checkout', {
            state: {
                items: [cartItem],
            },
        });
    };
    const shopId = product.ownerId || product.sellerId;
    const shopCreatedAt = shopInfo?.createdAt ? new Date(shopInfo.createdAt) : null;
    const shopJoinDate = shopCreatedAt
        ? new Date(shopCreatedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
        : null;
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-3", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate(-1), className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Quay l\u1EA1i"] }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "relative aspect-square bg-muted rounded-lg overflow-hidden mb-4", children: [_jsx(ImageWithFallback, { src: productImages[selectedImageIndex] || product.image, alt: product.name, className: "w-full h-full object-cover" }), product.isSale && (_jsxs(Badge, { className: "absolute top-4 left-4 bg-destructive", children: ["-", discount, "%"] })), product.isNew && (_jsx(Badge, { className: "absolute top-4 right-4 bg-blue-500", children: "M\u1EDBi" })), productImages.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", size: "sm", className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handlePrevImage, children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "secondary", size: "sm", className: "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handleNextImage, children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }))] }), productImages.length > 1 && (_jsx("div", { className: "grid grid-cols-5 gap-2", children: productImages.map((img, idx) => (_jsx("button", { onClick: () => setSelectedImageIndex(idx), className: `aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex
                                                ? 'border-primary'
                                                : 'border-transparent hover:border-muted-foreground/30'}`, children: _jsx(ImageWithFallback, { src: img, alt: `${product.name} ${idx + 1}`, className: "w-full h-full object-cover" }) }, idx))) }))] }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-3", children: product.name }), _jsxs("div", { className: "flex items-center gap-4 mb-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-lg font-semibold text-primary", children: product.ratingAvg || product.rating || 0 }), _jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-5 h-5 ${star <= (product.ratingAvg || product.rating || 0)
                                                                ? 'fill-primary text-primary'
                                                                : 'text-muted-foreground/30'}` }, star))) })] }), _jsx(Separator, { orientation: "vertical", className: "h-5" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [reviews.length.toLocaleString(), " \u0110\u00E1nh gi\u00E1"] }), _jsx(Separator, { orientation: "vertical", className: "h-5" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [soldCount.toLocaleString(), " \u0110\u00E3 b\u00E1n"] })] }), _jsx("div", { className: "bg-muted/50 p-6 rounded-lg mb-6", children: _jsxs("div", { className: "flex items-baseline gap-3", children: [product.originalPrice && (_jsxs("span", { className: "text-lg text-muted-foreground line-through", children: ["\u20AB", product.originalPrice.toLocaleString()] })), _jsxs("span", { className: "text-4xl font-bold text-primary", children: ["\u20AB", product.price.toLocaleString()] }), product.isSale && (_jsxs(Badge, { variant: "destructive", className: "ml-2 text-sm", children: ["-", discount, "%"] }))] }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(TruckIcon, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "Mi\u1EC5n ph\u00ED v\u1EADn chuy\u1EC3n cho \u0111\u01A1n t\u1EEB 500.000\u0111" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Shield, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "B\u1EA3o h\u00E0nh ch\u00EDnh h\u00E3ng 12 th\u00E1ng" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Package, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "\u0110\u1ED5i tr\u1EA3 mi\u1EC5n ph\u00ED trong 7 ng\u00E0y" })] })] }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "Th\u01B0\u01A1ng hi\u1EC7u:" }), _jsx("span", { className: "text-sm font-medium", children: product.brand })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "S\u1ED1 l\u01B0\u1EE3ng c\u00F2n l\u1EA1i:" }), _jsx("span", { className: "text-sm font-medium", children: typeof product.stock === 'number' ? `${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("span", { className: "text-sm text-muted-foreground block mb-2", children: "S\u1ED1 l\u01B0\u1EE3ng:" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center border border-border rounded-lg", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(-1), disabled: quantity <= 1, className: "h-10 w-10 p-0 rounded-none", children: "-" }), _jsx("span", { className: "w-12 text-center", children: quantity }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(1), className: "h-10 w-10 p-0 rounded-none", children: "+" })] }), _jsx("span", { className: "text-sm text-muted-foreground", children: typeof product.stock === 'number' ? `Còn ${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "flex gap-3 mb-6", children: [_jsxs(Button, { variant: "outline", className: "flex-1 gap-2 text-black h-12", onClick: (e) => handleAddToCart(e), disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-5 h-5" }), "Th\u00EAm v\u00E0o gi\u1ECF h\u00E0ng"] }), _jsx(Button, { className: "flex-1 gap-2 h-12", onClick: handleBuyNow, disabled: !product.inStock, children: "Mua ngay" })] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", children: [_jsx(Share2, { className: "w-4 h-4" }), "Chia s\u1EBB"] })] })] }), shopId && (_jsx(Card, { className: "p-6 mb-8", children: _jsxs("div", { className: "flex items-center gap-6 flex-wrap", children: [_jsx(Avatar, { className: "w-20 h-20", children: shopInfo?.avatar ? (_jsx(ImageWithFallback, { src: shopInfo.avatar, alt: shopInfo.shopName || 'Shop', className: "w-full h-full object-cover" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold", children: _jsx(Store, { className: "w-10 h-10" }) })) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("button", { onClick: () => navigate(`/shop?ownerId=${shopId}`), className: "text-xl font-semibold hover:text-primary transition-colors mb-1", children: loadingShop
                                                ? 'Đang tải...'
                                                : shopInfo?.shopName || product.brand || 'Shop Đối tác' }), _jsxs("div", { className: "flex items-center gap-4 flex-wrap mt-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 fill-yellow-400 text-yellow-400" }), _jsx("span", { className: "text-sm", children: "4.8" })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Package, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [loadingShopProducts ? '...' : shopProducts.length, " s\u1EA3n ph\u1EA9m"] })] }), shopJoinDate && (_jsx("div", { className: "flex items-center gap-1", children: _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Tham gia: ", shopJoinDate] }) }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate(`/shop?ownerId=${shopId}`), children: "Xem shop" }), _jsxs(Button, { variant: "outline", onClick: () => {
                                                if (!app.isLoggedIn) {
                                                    app.handleLogin();
                                                    return;
                                                }
                                                if (shopId) {
                                                    // Navigate to chat page with shopId as query param
                                                    // ChatPage will handle opening the conversation
                                                    const productIdToChat = product?.id || id;
                                                    if (productIdToChat) {
                                                        sessionStorage.setItem('chat:selectedProductId', productIdToChat);
                                                    }
                                                    navigate(`/chat?userId=${shopId}`);
                                                }
                                                else {
                                                    toast.error('Không tìm thấy thông tin shop');
                                                }
                                            }, className: "gap-2", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), "Chat v\u1EDBi shop"] })] })] }) })), _jsxs(Card, { className: "p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Th\u00F4ng s\u1ED1 k\u1EF9 thu\u1EADt" }), _jsx("div", { className: "space-y-3", children: Object.entries(specifications).map(([key, value]) => (_jsxs("div", { className: "flex py-2 border-b border-border last:border-0", children: [_jsx("span", { className: "text-sm text-muted-foreground w-1/3", children: key }), _jsx("span", { className: "text-sm flex-1", children: String(value) })] }, key))) })] }), _jsxs(Card, { className: "p-6 mb-8", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "M\u00F4 t\u1EA3 s\u1EA3n ph\u1EA9m" }), _jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("p", { className: "whitespace-pre-wrap", children: product.description }) })] }), _jsxs(Card, { className: "p-6 mb-8", children: [_jsxs("div", { ref: reviewSectionRef, children: [_jsx("h2", { className: "text-xl font-semibold mb-6", children: "\u0110\u00E1nh gi\u00E1 s\u1EA3n ph\u1EA9m" }), !isFocusReviewMode && (_jsxs(_Fragment, { children: [_jsx("div", { className: "bg-muted/30 rounded-lg p-6 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-5xl mb-2", children: product.ratingAvg || product.rating || 0 }), _jsx("div", { className: "flex items-center justify-center gap-1 mb-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-5 h-5 ${star <= (product.ratingAvg || product.rating || 0)
                                                                            ? 'fill-primary text-primary'
                                                                            : 'text-muted-foreground/30'}` }, star))) }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [reviews.length.toLocaleString(), " \u0111\u00E1nh gi\u00E1"] })] }), _jsxs("div", { className: "space-y-2", children: [ratingBreakdown.map((item) => (_jsx("div", { className: "flex items-center gap-3", children: _jsxs("button", { onClick: () => {
                                                                            setSelectedRating(item.stars === selectedRating ? null : item.stars);
                                                                            setReviewPage(1);
                                                                        }, className: `flex items-center gap-2 text-sm transition-colors ${selectedRating === item.stars
                                                                            ? 'text-primary font-semibold'
                                                                            : 'text-muted-foreground hover:text-primary'}`, children: [_jsxs("span", { className: "w-12", children: [item.stars, " sao"] }), _jsx(Progress, { value: item.percentage, className: "flex-1 h-2" }), _jsx("span", { className: "w-12 text-right", children: item.count })] }) }, item.stars))), selectedRating && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                        setSelectedRating(null);
                                                                        setReviewPage(1);
                                                                    }, className: "mt-2", children: "X\u00F3a b\u1ED9 l\u1ECDc" }))] })] }) }), product.reviewSummary && (_jsx(Card, { className: "border-2 bg-gradient-to-br from-primary/5 to-primary/10 mb-6", children: _jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center", children: _jsx(Sparkles, { className: "w-4 h-4 text-primary" }) }), _jsx("h3", { className: "font-bold text-lg", children: "T\u00F3m t\u1EAFt \u0111\u00E1nh gi\u00E1 (AI)" })] }), _jsx("p", { className: "text-sm leading-relaxed text-foreground/90", children: product.reviewSummary })] }) }))] })), _jsx("div", { className: "space-y-6", children: loadingReviews ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "\u0110ang t\u1EA3i \u0111\u00E1nh gi\u00E1..." })) : displayedReviews.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: isFocusReviewMode
                                                ? 'Không tìm thấy đánh giá này'
                                                : selectedRating
                                                    ? `Chưa có đánh giá ${selectedRating} sao`
                                                    : 'Chưa có đánh giá nào cho sản phẩm này' })) : (displayedReviews.map((review) => (_jsx("div", { ref: (el) => {
                                                reviewItemRefs.current[review.id] = el;
                                            }, className: `border-b border-border pb-6 last:border-0 ${targetReviewId === review.id ? 'rounded-lg bg-primary/5 ring-2 ring-primary/20 p-3' : ''}`, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Avatar, { className: "w-10 h-10", children: review.userAvatar ? (_jsx(ImageWithFallback, { src: review.userAvatar, alt: review.userName, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium", children: review.userName.charAt(0).toUpperCase() })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium", children: review.userName }), review.isVerifiedPurchase && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "\u0110\u00E3 mua h\u00E0ng" }))] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-3 h-3 ${star <= review.rating
                                                                                ? 'fill-primary text-primary'
                                                                                : 'text-muted-foreground/30'}` }, star))) }), _jsx("span", { className: "text-xs text-muted-foreground", children: review.date })] }), _jsx("p", { className: "text-sm mb-3", children: review.comment }), review.images && review.images.length > 0 && (_jsx("div", { className: "grid grid-cols-4 gap-2 mb-3", children: review.images.map((img, idx) => {
                                                                    // Convert Google Drive URL to displayable format
                                                                    const convertGoogleDriveUrl = (url) => {
                                                                        if (!url || typeof url !== 'string')
                                                                            return url;
                                                                        const trimmedUrl = url.trim();
                                                                        let fileId = null;
                                                                        // Handle Google Drive thumbnail URL
                                                                        if (trimmedUrl.includes('drive.google.com/thumbnail')) {
                                                                            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                                                            if (match && match[1]) {
                                                                                fileId = match[1];
                                                                            }
                                                                        }
                                                                        // Handle Google Drive file URL
                                                                        else if (trimmedUrl.includes('drive.google.com/file/d/')) {
                                                                            const match = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                                                                            if (match && match[1]) {
                                                                                fileId = match[1];
                                                                            }
                                                                        }
                                                                        // Handle Google Drive uc URL
                                                                        else if (trimmedUrl.includes('drive.google.com/uc')) {
                                                                            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                                                            if (match && match[1]) {
                                                                                fileId = match[1];
                                                                            }
                                                                        }
                                                                        // Already converted
                                                                        else if (trimmedUrl.includes('lh3.googleusercontent.com')) {
                                                                            return url;
                                                                        }
                                                                        if (fileId) {
                                                                            return `https://lh3.googleusercontent.com/d/${fileId}`;
                                                                        }
                                                                        return url;
                                                                    };
                                                                    const convertedUrl = convertGoogleDriveUrl(img);
                                                                    return (_jsx("div", { className: "relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity", onClick: () => window.open(img, '_blank'), children: _jsx(ImageWithFallback, { src: convertedUrl, alt: `Review image ${idx + 1}`, className: "w-full h-full object-cover" }) }, idx));
                                                                }) })), _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 h-8", children: [_jsx(ThumbsUp, { className: "w-3 h-3" }), "H\u1EEFu \u00EDch (", review.helpful, ")"] }), _jsx(Button, { variant: "ghost", size: "sm", className: "gap-2 h-8", onClick: () => toggleSellerReply(review.id), children: "Xem th\u00EAm" }), isProductOwner && (_jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 h-8", onClick: () => openReplyEditor(review.id), children: [_jsx(Reply, { className: "w-3 h-3" }), "Tr\u1EA3 l\u1EDDi"] }))] }), (expandedSellerReplyByReviewId[review.id] || replyEditorReviewId === review.id) && (_jsxs("div", { className: "rounded-lg border border-border bg-muted/20 p-3", children: [_jsx("div", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Ph\u1EA3n h\u1ED3i t\u1EEB shop" }), expandedSellerReplyByReviewId[review.id] && ((getSellerReplyForReview(review) ? (_jsx("div", { className: "text-sm text-foreground/90 whitespace-pre-wrap", children: getSellerReplyForReview(review) })) : null)), replyEditorReviewId === review.id && isProductOwner && (_jsx("div", { className: "mt-3", children: (() => {
                                                                                    const isSending = sendingSellerReplyReviewId === review.id;
                                                                                    return (_jsxs(_Fragment, { children: [_jsx("textarea", { ref: (el) => {
                                                                                                    if (replyEditorReviewId === review.id) {
                                                                                                        replyTextareaRef.current = el;
                                                                                                    }
                                                                                                }, value: replyDraftsByReviewId[review.id] || '', onChange: (e) => setReplyDraftsByReviewId((prev) => ({
                                                                                                    ...prev,
                                                                                                    [review.id]: e.target.value,
                                                                                                })), placeholder: "Nh\u1EADp ph\u1EA3n h\u1ED3i c\u1EE7a shop...", disabled: isSending, className: "w-full min-h-[90px] rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" }), _jsxs("div", { className: "flex items-center justify-end gap-2 mt-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: cancelReplyEditor, disabled: isSending, children: "H\u1EE7y" }), _jsx(Button, { size: "sm", onClick: () => saveSellerReply(review.id), disabled: isSending, children: isSending ? 'Đang gửi...' : 'Gửi' })] })] }));
                                                                                })() }))] }))] })] })] }) }, review.id)))) })] }), !isFocusReviewMode && totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-6", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setReviewPage((prev) => Math.max(1, prev - 1)), disabled: reviewPage === 1, children: [_jsx(ChevronLeft, { className: "w-4 h-4" }), "Tr\u01B0\u1EDBc"] }), _jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (_jsx(Button, { variant: reviewPage === page ? 'default' : 'outline', size: "sm", onClick: () => setReviewPage(page), className: "w-10", children: page }, page))) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setReviewPage((prev) => Math.min(totalPages, prev + 1)), disabled: reviewPage === totalPages, children: ["Sau", _jsx(ChevronRight, { className: "w-4 h-4" })] })] }))] }), shopProducts.length > 0 && (_jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-xl font-semibold mb-6", children: ["S\u1EA3n ph\u1EA9m kh\u00E1c c\u1EE7a ", shopInfo?.shopName || 'shop'] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4", children: shopProducts.map((shopProduct) => (_jsx(ProductCard, { product: shopProduct, onAddToCart: app.addToCart, onViewDetail: (p) => {
                                        const nextPath = `/product/${p.id}`;
                                        clearSavedScrollPositionForPath(nextPath);
                                        navigate(nextPath);
                                    }, onTriggerFlyingIcon: app.handleTriggerFlyingIcon, isLoggedIn: app.isLoggedIn, onLogin: app.handleLogin }, shopProduct.id))) })] }))] }), app.flyingIcons && app.flyingIcons.length > 0 && (_jsx("div", { className: "fixed inset-0 pointer-events-none z-50" }))] }));
}
