import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight, Package, Share2, Shield, ShoppingCart, Star, Store, ThumbsUp, TruckIcon, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mapReviewResponse, reviewApi } from '../../apis/review';
import { userApi } from '../../apis/user';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
export function ProductDetailModal({ isOpen, onClose, product, onAddToCart, onTriggerFlyingIcon, isLoggedIn = false, onLogin, }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [shopInfo, setShopInfo] = useState(null);
    const [loadingShop, setLoadingShop] = useState(false);
    // Comment form state
    const [commentRating, setCommentRating] = useState(5);
    const [commentText, setCommentText] = useState('');
    const [commentImages, setCommentImages] = useState([]);
    const [commentImagePreviews, setCommentImagePreviews] = useState([]);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    // Load reviews khi modal mở
    useEffect(() => {
        if (isOpen && product?.id) {
            loadReviews();
            loadShopInfo();
        }
    }, [isOpen, product?.id, product?.ownerId, product?.sellerId]);
    const loadShopInfo = async () => {
        const shopId = product.ownerId || product.sellerId;
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
    const loadReviews = async () => {
        try {
            setLoadingReviews(true);
            const data = await reviewApi.findAll({ productId: product.id });
            const mappedReviews = data.map(mapReviewResponse);
            setReviews(mappedReviews);
        }
        catch (error) {
            console.error('Failed to load reviews:', error);
            // Fallback to empty array if API fails
            setReviews([]);
        }
        finally {
            setLoadingReviews(false);
        }
    };
    // Handlers cho comment form
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newFiles = [...commentImages, ...files].slice(0, 5); // Tối đa 5 ảnh
            setCommentImages(newFiles);
            // Tạo preview URLs
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setCommentImagePreviews(newPreviews);
        }
    };
    const removeImage = (index) => {
        const newFiles = commentImages.filter((_, i) => i !== index);
        const newPreviews = commentImagePreviews.filter((_, i) => i !== index);
        // Revoke old URL để tránh memory leak
        URL.revokeObjectURL(commentImagePreviews[index]);
        setCommentImages(newFiles);
        setCommentImagePreviews(newPreviews);
    };
    const handleSubmitComment = async () => {
        if (!isLoggedIn) {
            onLogin?.();
            return;
        }
        if (commentText.trim() === '' && commentImages.length === 0) {
            toast.error('Vui lòng nhập bình luận hoặc thêm ảnh');
            return;
        }
        try {
            setIsSubmittingComment(true);
            // Upload images (mock - trong thực tế cần API upload)
            const uploadedImageUrls = [];
            // TODO: Implement image upload API
            // Submit review
            await reviewApi.create({
                productId: product.id,
                rating: commentRating,
                comment: commentText.trim(),
                images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
            });
            toast.success('Đã thêm bình luận thành công!');
            // Reset form
            setCommentText('');
            setCommentImages([]);
            setCommentImagePreviews([]);
            setCommentRating(5);
            // Reload reviews
            await loadReviews();
        }
        catch (error) {
            console.error('Failed to submit comment:', error);
            toast.error('Không thể thêm bình luận. Vui lòng thử lại.');
        }
        finally {
            setIsSubmittingComment(false);
        }
    };
    if (!isOpen || !product)
        return null;
    // Mock data cho nhiều ảnh sản phẩm
    const productImages = product.images || [product.image, product.image, product.image];
    // Calculate rating breakdown from reviews
    const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.filter(r => r.rating === stars).length;
        const total = reviews.length || 1;
        return {
            stars,
            count,
            percentage: Math.round((count / total) * 100),
        };
    });
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
    const handleAddToCart = (e) => {
        if (!isLoggedIn) {
            onLogin?.();
            return;
        }
        // Trigger flying animation
        if (onTriggerFlyingIcon && e?.currentTarget) {
            onTriggerFlyingIcon('cart', e.currentTarget);
        }
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product);
        }
    };
    const handleBuyNow = () => {
        if (!isLoggedIn) {
            onLogin?.();
            return;
        }
        // Convert product to CartItem
        const cartItem = {
            ...product,
            quantity: quantity,
            selected: true,
        };
        // Đóng modal trước khi navigate
        if (onClose) {
            onClose();
        }
        // Navigate to checkout with product
        navigate('/checkout', {
            state: {
                items: [cartItem],
            },
        });
    };
    const soldCount = product.soldCount || Math.floor(Math.random() * 10000);
    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
        else {
            console.error('ProductDetailModal: onClose is not a function', { onClose });
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4", onClick: (e) => {
            // Đóng modal khi click vào overlay (background)
            if (e.target === e.currentTarget) {
                handleClose();
            }
        }, children: _jsxs("div", { className: "bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10", children: [_jsx("h2", { className: "text-lg", children: "Chi ti\u1EBFt s\u1EA3n ph\u1EA9m" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: handleClose, className: "w-8 h-8 p-0 rounded-full hover:bg-muted", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx(ScrollArea, { className: "h-[calc(90vh-80px)]", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "relative aspect-square bg-muted rounded-lg overflow-hidden mb-4", children: [_jsx(ImageWithFallback, { src: productImages[selectedImageIndex], alt: product.name, className: "w-full h-full object-cover" }), product.isSale && (_jsxs(Badge, { className: "absolute top-4 left-4 bg-destructive", children: ["-", discount, "%"] })), product.isNew && (_jsx(Badge, { className: "absolute top-4 right-4 bg-blue-500", children: "M\u1EDBi" })), productImages.length > 1 && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", size: "sm", className: "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handlePrevImage, children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "secondary", size: "sm", className: "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full", onClick: handleNextImage, children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] }))] }), _jsx("div", { className: "grid grid-cols-5 gap-2", children: productImages.map((img, idx) => (_jsx("button", { onClick: () => setSelectedImageIndex(idx), className: `aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex
                                                        ? 'border-primary'
                                                        : 'border-transparent hover:border-muted-foreground/30'}`, children: _jsx(ImageWithFallback, { src: img, alt: `${product.name} ${idx + 1}`, className: "w-full h-full object-cover" }) }, idx))) })] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl mb-2", children: product.name }), (product.ownerId || product.sellerId) && (_jsx("div", { className: "mb-3", children: _jsxs("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        const shopId = product.ownerId || product.sellerId;
                                                        if (shopId) {
                                                            // Đóng modal trước khi navigate
                                                            if (onClose) {
                                                                onClose();
                                                            }
                                                            navigate(`/shop?ownerId=${shopId}`);
                                                        }
                                                    }, className: "flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors group", disabled: loadingShop, children: [_jsx(Store, { className: "w-4 h-4 group-hover:scale-110 transition-transform" }), _jsx("span", { className: "font-medium", children: loadingShop
                                                                ? 'Đang tải...'
                                                                : shopInfo?.shopName
                                                                    ? `Shop ${shopInfo.shopName}`
                                                                    : product.brand
                                                                        ? `Shop ${product.brand}`
                                                                        : 'Shop Đối tác' })] }) })), _jsxs("div", { className: "flex items-center gap-4 mb-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-primary", children: product.rating }), _jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-4 h-4 ${star <= product.rating
                                                                        ? 'fill-primary text-primary'
                                                                        : 'text-muted-foreground/30'}` }, star))) })] }), _jsx(Separator, { orientation: "vertical", className: "h-4" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [product.reviews.toLocaleString(), " \u0110\u00E1nh gi\u00E1"] }), _jsx(Separator, { orientation: "vertical", className: "h-4" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [soldCount.toLocaleString(), " \u0110\u00E3 b\u00E1n"] })] }), _jsx("div", { className: "bg-muted/50 p-4 rounded-lg mb-4", children: _jsxs("div", { className: "flex items-baseline gap-3", children: [product.originalPrice && (_jsxs("span", { className: "text-sm text-muted-foreground line-through", children: ["\u20AB", product.originalPrice.toLocaleString()] })), _jsxs("span", { className: "text-3xl text-primary", children: ["\u20AB", product.price.toLocaleString()] }), product.isSale && (_jsxs(Badge, { variant: "destructive", className: "ml-2", children: ["-", discount, "%"] }))] }) }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "Th\u01B0\u01A1ng hi\u1EC7u:" }), _jsx("span", { className: "text-sm", children: product.brand })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground w-32", children: "S\u1ED1 l\u01B0\u1EE3ng c\u00F2n l\u1EA1i:" }), _jsx("span", { className: "text-sm font-medium", children: typeof product.stock === 'number' ? `${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "mb-6", children: [_jsx("span", { className: "text-sm text-muted-foreground block mb-2", children: "S\u1ED1 l\u01B0\u1EE3ng:" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center border border-border rounded-lg", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(-1), disabled: quantity <= 1, className: "h-10 w-10 p-0 rounded-none", children: "-" }), _jsx("span", { className: "w-12 text-center", children: quantity }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleQuantityChange(1), className: "h-10 w-10 p-0 rounded-none", children: "+" })] }), _jsx("span", { className: "text-sm text-muted-foreground", children: typeof product.stock === 'number' ? `Còn ${product.stock} sản phẩm` : '0 sản phẩm' })] })] }), _jsxs("div", { className: "flex gap-3 mb-6", children: [_jsxs(Button, { variant: "outline", className: "flex-1 gap-2 text-black", onClick: (e) => handleAddToCart(e), disabled: !product.inStock, children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "Th\u00EAm v\u00E0o gi\u1ECF h\u00E0ng"] }), _jsx(Button, { className: "flex-1 gap-2", onClick: handleBuyNow, disabled: !product.inStock, children: "Mua ngay" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "ghost", size: "sm", className: "flex-1 gap-2", children: [_jsx(Share2, { className: "w-4 h-4" }), "Chia s\u1EBB"] }) }), _jsxs("div", { className: "mt-6 pt-6 border-t border-border space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Shield, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "B\u1EA3o h\u00E0nh ch\u00EDnh h\u00E3ng 12 th\u00E1ng" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(Package, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "\u0110\u1ED5i tr\u1EA3 mi\u1EC5n ph\u00ED trong 7 ng\u00E0y" })] }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsx(TruckIcon, { className: "w-5 h-5 text-primary" }), _jsx("span", { children: "Mi\u1EC5n ph\u00ED v\u1EADn chuy\u1EC3n cho \u0111\u01A1n t\u1EEB 500.000\u0111" })] })] })] })] }), _jsxs(Tabs, { defaultValue: "description", className: "w-full", children: [_jsxs(TabsList, { className: "w-full justify-start border-b rounded-none h-auto p-0 bg-transparent", children: [_jsx(TabsTrigger, { value: "description", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: "M\u00F4 t\u1EA3 s\u1EA3n ph\u1EA9m" }), _jsx(TabsTrigger, { value: "specifications", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: "Th\u00F4ng s\u1ED1 k\u1EF9 thu\u1EADt" }), _jsxs(TabsTrigger, { value: "reviews", className: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary", children: ["\u0110\u00E1nh gi\u00E1 (", product.reviews, ")"] })] }), _jsx(TabsContent, { value: "description", className: "py-6", children: _jsx("div", { className: "prose prose-sm max-w-none", children: _jsx("p", { children: product.description }) }) }), _jsx(TabsContent, { value: "specifications", className: "py-6", children: _jsx("div", { className: "space-y-3", children: Object.entries(specifications).map(([key, value]) => (_jsxs("div", { className: "flex py-2 border-b border-border", children: [_jsx("span", { className: "text-sm text-muted-foreground w-1/3", children: key }), _jsx("span", { className: "text-sm flex-1", children: value })] }, key))) }) }), _jsxs(TabsContent, { value: "reviews", className: "py-6", children: [_jsx("div", { className: "bg-muted/30 rounded-lg p-6 mb-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-5xl mb-2", children: product.rating }), _jsx("div", { className: "flex items-center justify-center gap-1 mb-2", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-5 h-5 ${star <= product.rating
                                                                            ? 'fill-primary text-primary'
                                                                            : 'text-muted-foreground/30'}` }, star))) }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [product.reviews.toLocaleString(), " \u0111\u00E1nh gi\u00E1"] })] }), _jsx("div", { className: "space-y-2", children: ratingBreakdown.map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-sm w-12", children: [item.stars, " sao"] }), _jsx(Progress, { value: item.percentage, className: "flex-1 h-2" }), _jsx("span", { className: "text-sm text-muted-foreground w-12 text-right", children: item.count })] }, item.stars))) })] }) }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6 mb-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Vi\u1EBFt \u0111\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n" }), !isLoggedIn ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "B\u1EA1n c\u1EA7n \u0111\u0103ng nh\u1EADp \u0111\u1EC3 vi\u1EBFt \u0111\u00E1nh gi\u00E1" }), _jsx(Button, { onClick: onLogin, children: "\u0110\u0103ng nh\u1EADp" })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "mb-2 block", children: "\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n" }), _jsxs("div", { className: "flex items-center gap-2", children: [[1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setCommentRating(star), className: "focus:outline-none transition-transform hover:scale-110", children: _jsx(Star, { className: `w-8 h-8 transition-colors ${star <= commentRating
                                                                                        ? 'fill-primary text-primary'
                                                                                        : 'text-muted-foreground/30 hover:text-primary/50'}` }) }, star))), _jsxs("span", { className: "ml-2 text-sm text-muted-foreground", children: [commentRating, " sao"] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "comment-text", className: "mb-2 block", children: "B\u00ECnh lu\u1EADn" }), _jsx(Textarea, { id: "comment-text", placeholder: "Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n v\u1EC1 s\u1EA3n ph\u1EA9m n\u00E0y...", value: commentText, onChange: (e) => setCommentText(e.target.value), className: "min-h-24", rows: 4 })] }), _jsxs("div", { children: [_jsx(Label, { className: "mb-2 block", children: "Th\u00EAm \u1EA3nh (t\u1ED1i \u0111a 5 \u1EA3nh)" }), _jsxs("div", { className: "space-y-3", children: [commentImagePreviews.length > 0 && (_jsx("div", { className: "grid grid-cols-5 gap-2", children: commentImagePreviews.map((preview, index) => (_jsxs("div", { className: "relative group", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full aspect-square object-cover rounded-lg border border-border" }), _jsx("button", { type: "button", onClick: () => removeImage(index), className: "absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) })), commentImages.length < 5 && (_jsxs("div", { children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handleImageSelect, className: "hidden" }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => fileInputRef.current?.click(), className: "gap-2", children: [_jsx(Upload, { className: "w-4 h-4" }), "Th\u00EAm \u1EA3nh", commentImages.length > 0 && (_jsxs("span", { className: "text-xs text-muted-foreground", children: ["(", commentImages.length, "/5)"] }))] })] }))] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleSubmitComment, disabled: isSubmittingComment || (commentText.trim() === '' && commentImages.length === 0), className: "gap-2", children: isSubmittingComment ? 'Đang gửi...' : 'Gửi đánh giá' }) })] }))] }), _jsx("div", { className: "space-y-6", children: loadingReviews ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "\u0110ang t\u1EA3i \u0111\u00E1nh gi\u00E1..." })) : reviews.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Ch\u01B0a c\u00F3 \u0111\u00E1nh gi\u00E1 n\u00E0o cho s\u1EA3n ph\u1EA9m n\u00E0y" })) : (reviews.map((review) => (_jsx("div", { className: "border-b border-border pb-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Avatar, { className: "w-10 h-10", children: review.userAvatar ? (_jsx(ImageWithFallback, { src: review.userAvatar, alt: review.userName, className: "w-full h-full object-cover" })) : (_jsx("span", { className: "w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium", children: review.userName.charAt(0).toUpperCase() })) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { children: review.userName }), review.isVerifiedPurchase && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "\u0110\u00E3 mua h\u00E0ng" }))] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(Star, { className: `w-3 h-3 ${star <= review.rating
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
                                                                        }) })), _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2 h-8", children: [_jsx(ThumbsUp, { className: "w-3 h-3" }), "H\u1EEFu \u00EDch (", review.helpful, ")"] })] })] }) }, review.id)))) })] })] })] }) })] }) }));
}
