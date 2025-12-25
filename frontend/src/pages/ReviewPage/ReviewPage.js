import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ReviewPage - Trang đánh giá sản phẩm
 * Hiển thị thông tin sản phẩm, các đánh giá trước đó, và form đánh giá mới
 */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppContext } from '../../providers/AppProvider';
// UI Components
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
// Icons
import { ArrowLeft, Calendar, DollarSign, Image as ImageIcon, Loader2, Package, Star, User, X, } from 'lucide-react';
// Types & Utils
import { mediaApi } from '../../apis/media';
import { productService } from '../../apis/product';
import { reviewService } from '../../apis/review';
import { mapReviewResponse } from '../../apis/review/review.mapper';
import { formatPrice } from '../../utils/utils';
export function ReviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId } = useParams();
    const app = useAppContext();
    useLayoutEffect(() => {
        try {
            const stored = sessionStorage.getItem('scrollPositions');
            if (stored) {
                const positions = JSON.parse(stored);
                delete positions[location.pathname];
                sessionStorage.setItem('scrollPositions', JSON.stringify(positions));
            }
        }
        catch {
            // ignore
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [location.pathname, location.search]);
    // State
    const [order, setOrder] = useState(null);
    const [product, setProduct] = useState(null);
    const [orderItem, setOrderItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const targetProductId = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get('productId');
        return value && value.trim() ? value.trim() : null;
    }, [location.search]);
    // Review form state
    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(null);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    // Load order and product data
    useEffect(() => {
        const loadData = async () => {
            if (!orderId || !app.isLoggedIn) {
                navigate('/orders');
                return;
            }
            setIsLoading(true);
            try {
                // Try to find order in context first
                let foundOrder = app.orders.orders.find((o) => o.id === orderId);
                // If not found, try to load from API
                if (!foundOrder) {
                    // Try to load all orders for user (without status filter to get all)
                    await app.orders.loadOrdersForUser();
                    foundOrder = app.orders.orders.find((o) => o.id === orderId);
                }
                if (!foundOrder) {
                    toast.error('Không tìm thấy đơn hàng');
                    navigate('/orders');
                    return;
                }
                setOrder(foundOrder);
                // Load product details (lấy theo productId trên query nếu có, fallback item đầu tiên)
                if (foundOrder.items && foundOrder.items.length > 0) {
                    const matchedItem = targetProductId
                        ? foundOrder.items.find((it) => (it.productId || it.id) === targetProductId)
                        : null;
                    const selectedItem = matchedItem || foundOrder.items[0];
                    const productId = selectedItem.productId || selectedItem.id;
                    setOrderItem(selectedItem);
                    try {
                        const productData = await productService.getById(productId);
                        setProduct(productData);
                        // Load reviews for this product
                        const reviewsData = await reviewService.findAll({ productId: productData.id });
                        const mappedReviews = reviewsData.map(mapReviewResponse);
                        setReviews(mappedReviews);
                    }
                    catch (error) {
                        console.error('Error loading product:', error);
                    }
                }
            }
            catch (error) {
                console.error('Error loading data:', error);
                toast.error('Không thể tải dữ liệu');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [orderId, app.isLoggedIn, app.orders.orders, navigate, targetProductId]);
    // Handle image upload
    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (!files)
            return;
        const newImages = Array.from(files);
        setImages(prev => [...prev, ...newImages]);
        // Create previews
        newImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };
    // Handle submit review
    const handleSubmitReview = async () => {
        if (!order || !product)
            return;
        if (comment.trim().length === 0) {
            toast.error('Vui lòng nhập đánh giá');
            return;
        }
        setIsSubmitting(true);
        try {
            // Upload images first
            const imageUrls = [];
            for (const imageFile of images) {
                try {
                    const response = await mediaApi.upload(imageFile);
                    const imageUrl = response?.url?.thumbnailUrl || '';
                    if (imageUrl) {
                        imageUrls.push(imageUrl);
                    }
                }
                catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Lỗi khi tải ảnh lên');
                }
            }
            // Create review
            await reviewService.create({
                productId: product.id,
                rating,
                comment: comment.trim(),
                images: imageUrls.length > 0 ? imageUrls : undefined,
            });
            toast.success('Đánh giá đã được gửi thành công!');
            // Reload reviews
            const reviewsData = await reviewService.findAll({ productId: product.id });
            const mappedReviews = reviewsData.map(mapReviewResponse);
            setReviews(mappedReviews);
            // Reset form
            setRating(5);
            setComment('');
            setImages([]);
            setImagePreviews([]);
        }
        catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Render stars
    const renderStars = (currentRating, onRatingChange, interactive = true) => {
        return (_jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => interactive && onRatingChange(star), onMouseEnter: () => interactive && setHoveredStar(star), onMouseLeave: () => interactive && setHoveredStar(null), disabled: !interactive, className: `transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`, children: _jsx(Star, { className: `w-6 h-6 transition-colors ${star <= (interactive ? (hoveredStar || currentRating) : currentRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'}` }) }, star))) }));
    };
    const getRatingText = (rating) => {
        switch (rating) {
            case 1: return 'Rất tệ';
            case 2: return 'Tệ';
            case 3: return 'Bình thường';
            case 4: return 'Tốt';
            case 5: return 'Rất tốt';
            default: return '';
        }
    };
    // Convert Google Drive URL to displayable format
    const convertGoogleDriveUrl = (url) => {
        if (!url || typeof url !== 'string')
            return url;
        const trimmedUrl = url.trim();
        // Extract file ID from various Google Drive URL formats
        let fileId = null;
        // Handle Google Drive thumbnail URL: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
        // This is the most common format from backend
        if (trimmedUrl.includes('drive.google.com/thumbnail')) {
            // Match: ?id=FILE_ID or &id=FILE_ID
            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // Handle Google Drive file URL: https://drive.google.com/file/d/FILE_ID/view
        else if (trimmedUrl.includes('drive.google.com/file/d/')) {
            const match = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // Handle Google Drive uc URL: https://drive.google.com/uc?id=FILE_ID
        else if (trimmedUrl.includes('drive.google.com/uc')) {
            const match = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                fileId = match[1];
            }
        }
        // Handle lh3.googleusercontent.com (already converted)
        else if (trimmedUrl.includes('lh3.googleusercontent.com')) {
            return url; // Already in correct format
        }
        // Convert to lh3.googleusercontent.com format if we have a file ID
        if (fileId) {
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
        // Return original URL if not a Google Drive URL
        return url;
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-primary mx-auto mb-2" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\u0110ang t\u1EA3i..." })] }) }));
    }
    if (!order || !product || !orderItem) {
        return (_jsx("div", { className: "min-h-screen bg-background pt-16 flex items-center justify-center", children: _jsxs(Card, { className: "p-8 text-center", children: [_jsx("p", { className: "text-muted-foreground mb-4", children: "Kh\u00F4ng t\u00ECm th\u1EA5y \u0111\u01A1n h\u00E0ng ho\u1EB7c s\u1EA3n ph\u1EA9m" }), _jsx(Button, { onClick: () => navigate('/orders'), children: "Quay l\u1EA1i" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background pt-16", children: [_jsx("div", { className: "sticky top-16 z-30 bg-card border-b border-border", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate('/orders'), className: "gap-2", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Quay l\u1EA1i"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "\u0110\u00E1nh gi\u00E1 s\u1EA3n ph\u1EA9m" }), _jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n v\u1EC1 s\u1EA3n ph\u1EA9m" })] })] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex gap-6", children: [_jsx("div", { className: "w-32 h-32 rounded-lg overflow-hidden bg-muted shrink-0 border", children: _jsx(ImageWithFallback, { src: orderItem.image || product.image, alt: product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h2", { className: "text-xl font-semibold mb-2 line-clamp-2", children: product.name }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Package, { className: "w-4 h-4" }), _jsxs("span", { children: ["M\u00E3 \u0111\u01A1n: ", order.orderNumber] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsxs("span", { children: ["Ng\u00E0y mua: ", new Date(order.createdAt).toLocaleDateString('vi-VN')] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-4 h-4 text-primary" }), _jsx("span", { className: "text-lg font-bold text-primary", children: formatPrice(orderItem.price) })] }), orderItem.variant && (_jsx(Badge, { variant: "outline", className: "w-fit", children: orderItem.variant }))] })] })] }) }), _jsxs(Card, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "\u0110\u00E1nh gi\u00E1 t\u1EEB ng\u01B0\u1EDDi mua kh\u00E1c" }), _jsx(ScrollArea, { className: "h-[400px] pr-4", children: reviews.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Star, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }), _jsx("p", { children: "Ch\u01B0a c\u00F3 \u0111\u00E1nh gi\u00E1 n\u00E0o" })] })) : (_jsx("div", { className: "space-y-4", children: reviews.map((review) => (_jsx("div", { className: "border-b pb-4 last:border-0", children: _jsxs("div", { className: "flex items-start gap-3 mb-2", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0", children: _jsx(User, { className: "w-5 h-5 text-primary" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "font-medium text-sm", children: review.userName || 'Người dùng' }), review.isVerifiedPurchase && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "\u0110\u00E3 mua" }))] }), _jsxs("div", { className: "flex items-center gap-2 mb-2", children: [renderStars(review.rating, () => { }, false), _jsx("span", { className: "text-xs text-muted-foreground", children: review.updatedAt
                                                                                    ? `Cập nhật: ${new Date(review.updatedAt).toLocaleDateString('vi-VN', {
                                                                                        year: 'numeric',
                                                                                        month: 'long',
                                                                                        day: 'numeric'
                                                                                    })}`
                                                                                    : review.createdAt
                                                                                        ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                                                            year: 'numeric',
                                                                                            month: 'long',
                                                                                            day: 'numeric'
                                                                                        })
                                                                                        : new Date(review.date).toLocaleDateString('vi-VN', {
                                                                                            year: 'numeric',
                                                                                            month: 'long',
                                                                                            day: 'numeric'
                                                                                        }) })] }), review.comment && (_jsx("p", { className: "text-sm text-foreground mb-2 whitespace-pre-wrap break-words", children: review.comment })), review.images && review.images.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3 mt-3", children: review.images.map((img, idx) => {
                                                                            const convertedUrl = convertGoogleDriveUrl(img);
                                                                            return (_jsxs("div", { className: "relative w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity group", onClick: () => window.open(img, '_blank'), title: "Nh\u1EA5n \u0111\u1EC3 xem \u1EA3nh l\u1EDBn", children: [_jsx(ImageWithFallback, { src: convertedUrl, alt: `Review image ${idx + 1}`, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center", children: _jsx(ImageIcon, { className: "w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" }) })] }, idx));
                                                                        }) }))] })] }) }, review.id))) })) })] })] }), _jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { className: "p-6 sticky top-24", children: [_jsx("h3", { className: "text-lg font-semibold mb-6", children: "\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-base", children: "\u0110\u00E1nh gi\u00E1 s\u1EA3n ph\u1EA9m" }), _jsxs("div", { className: "flex items-center gap-4", children: [renderStars(rating, setRating, true), _jsx("span", { className: "text-sm font-medium text-primary", children: getRatingText(rating) })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { htmlFor: "comment", className: "text-base", children: "Nh\u1EADn x\u00E9t v\u1EC1 s\u1EA3n ph\u1EA9m" }), _jsx(Textarea, { id: "comment", placeholder: "H\u00E3y chia s\u1EBB nh\u1EEFng \u0111i\u1EC1u b\u1EA1n th\u00EDch v\u1EC1 s\u1EA3n ph\u1EA9m n\u00E0y v\u1EDBi nh\u1EEFng ng\u01B0\u1EDDi mua kh\u00E1c nh\u00E9.", value: comment, onChange: (e) => setComment(e.target.value), rows: 6, className: "resize-none break-all whitespace-pre-wrap" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [comment.length, "/500 k\u00FD t\u1EF1"] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-base", children: "Th\u00EAm h\u00ECnh \u1EA3nh (T\u00F9y ch\u1ECDn)" }), imagePreviews.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3", children: imagePreviews.map((preview, index) => (_jsxs("div", { className: "relative w-24 h-24 rounded-lg overflow-hidden group border", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { onClick: () => removeImage(index), className: "absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) })), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "file", id: "image-upload", accept: "image/*", multiple: true, onChange: handleImageUpload, className: "hidden" }), _jsxs(Label, { htmlFor: "image-upload", className: "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors w-full justify-center", children: [_jsx(ImageIcon, { className: "w-4 h-4" }), "Th\u00EAm h\u00ECnh \u1EA3nh"] })] })] }), _jsx(Separator, {}), _jsx(Button, { onClick: handleSubmitReview, disabled: isSubmitting || comment.trim().length === 0, className: "w-full", size: "lg", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "\u0110ang g\u1EEDi..."] })) : ('Gửi đánh giá') })] })] }) })] }) })] }));
}
