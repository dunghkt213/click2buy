import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Star, Video, X, Image as ImageIcon } from 'lucide-react';
import { formatPrice } from '../../utils/utils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
export function ReviewModal({ isOpen, onClose, order, onSubmitReview, }) {
    const [productRating, setProductRating] = useState(5);
    const [shippingRating, setShippingRating] = useState(5);
    const [sellerRating, setSellerRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [videoPreviews, setVideoPreviews] = useState([]);
    const [hoveredProductStar, setHoveredProductStar] = useState(null);
    const [hoveredShippingStar, setHoveredShippingStar] = useState(null);
    const [hoveredSellerStar, setHoveredSellerStar] = useState(null);
    if (!order)
        return null;
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
    const handleVideoUpload = (e) => {
        const files = e.target.files;
        if (!files)
            return;
        const newVideos = Array.from(files);
        setVideos(prev => [...prev, ...newVideos]);
        // Create previews
        newVideos.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };
    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };
    const removeVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
        setVideoPreviews(prev => prev.filter((_, i) => i !== index));
    };
    const handleSubmit = () => {
        const reviewData = {
            orderId: order.id,
            productRating,
            shippingRating,
            sellerRating,
            comment,
            images,
            videos,
            isAnonymous,
        };
        onSubmitReview(reviewData);
        handleClose();
    };
    const handleClose = () => {
        setProductRating(5);
        setShippingRating(5);
        setSellerRating(5);
        setComment('');
        setIsAnonymous(false);
        setImages([]);
        setVideos([]);
        setImagePreviews([]);
        setVideoPreviews([]);
        onClose();
    };
    const renderStars = (rating, setRating, hoveredStar, setHoveredStar) => {
        return (_jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoveredStar(star), onMouseLeave: () => setHoveredStar(null), className: "transition-transform hover:scale-110", children: _jsx(Star, { className: `w-8 h-8 transition-colors ${star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'}` }) }, star))) }));
    };
    const getRatingText = (rating) => {
        switch (rating) {
            case 1:
                return 'Rất tệ';
            case 2:
                return 'Tệ';
            case 3:
                return 'Bình thường';
            case 4:
                return 'Tốt';
            case 5:
                return 'Rất tốt';
            default:
                return '';
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "\u0110\u00E1nh gi\u00E1 s\u1EA3n ph\u1EA9m" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Badge, { variant: "outline", className: "shrink-0", children: order.orderNumber }), _jsx("span", { className: "text-sm text-muted-foreground", children: new Date(order.createdAt).toLocaleDateString('vi-VN') })] }), _jsx("div", { className: "space-y-3", children: order.items.map((item, index) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0", children: _jsx(ImageWithFallback, { src: item.image, alt: item.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "font-medium truncate", children: item.name }), item.variant && (_jsx("p", { className: "text-sm text-muted-foreground", children: item.variant })), _jsxs("div", { className: "flex items-center justify-between mt-1", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: ["x", item.quantity] }), _jsx("span", { className: "font-medium text-primary", children: formatPrice(item.price) })] })] })] }, index))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-base", children: "Ch\u1EA5t l\u01B0\u1EE3ng s\u1EA3n ph\u1EA9m" }), _jsxs("div", { className: "flex items-center gap-4", children: [renderStars(productRating, setProductRating, hoveredProductStar, setHoveredProductStar), _jsx("span", { className: "text-sm font-medium text-primary", children: getRatingText(productRating) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { htmlFor: "comment", className: "text-base", children: "Nh\u1EADn x\u00E9t v\u1EC1 s\u1EA3n ph\u1EA9m" }), _jsx(Textarea, { id: "comment", placeholder: "H\u00E3y chia s\u1EBB nh\u1EEFng \u0111i\u1EC1u b\u1EA1n th\u00EDch v\u1EC1 s\u1EA3n ph\u1EA9m n\u00E0y v\u1EDBi nh\u1EEFng ng\u01B0\u1EDDi mua kh\u00E1c nh\u00E9.", value: comment, onChange: (e) => setComment(e.target.value), rows: 5, 
                                    // Thêm 'break-all whitespace-pre-wrap' để xử lý chuỗi dài không có khoảng trắng
                                    className: "resize-none break-all whitespace-pre-wrap" }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [comment.length, "/500 k\u00FD t\u1EF1"] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-base", children: "Th\u00EAm h\u00ECnh \u1EA3nh/video (T\u00F9y ch\u1ECDn)" }), imagePreviews.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3 mb-3", children: imagePreviews.map((preview, index) => (_jsxs("div", { className: "relative w-24 h-24 rounded-lg overflow-hidden group", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-full object-cover" }), _jsx("button", { onClick: () => removeImage(index), className: "absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) })), videoPreviews.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-3 mb-3", children: videoPreviews.map((preview, index) => (_jsxs("div", { className: "relative w-24 h-24 rounded-lg overflow-hidden group bg-black", children: [_jsx("video", { src: preview, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(Video, { className: "w-8 h-8 text-white/70" }) }), _jsx("button", { onClick: () => removeVideo(index), className: "absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) })), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "file", id: "image-upload", accept: "image/*", multiple: true, onChange: handleImageUpload, className: "hidden" }), _jsxs(Label, { htmlFor: "image-upload", className: "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors", children: [_jsx(ImageIcon, { className: "w-4 h-4" }), "Th\u00EAm h\u00ECnh \u1EA3nh"] })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "file", id: "video-upload", accept: "video/*", multiple: true, onChange: handleVideoUpload, className: "hidden" }), _jsxs(Label, { htmlFor: "video-upload", className: "inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors", children: [_jsx(Video, { className: "w-4 h-4" }), "Th\u00EAm video"] })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/30", children: [_jsx(Checkbox, { id: "anonymous", checked: isAnonymous, onCheckedChange: (checked) => setIsAnonymous(checked) }), _jsx(Label, { htmlFor: "anonymous", className: "text-sm cursor-pointer select-none", children: "Hi\u1EC3n th\u1ECB t\u00EAn t\u00E0i kho\u1EA3n \u1EA9n danh" })] }), _jsxs("div", { className: "space-y-3 p-4 border border-border rounded-lg bg-muted/20", children: [_jsx(Label, { className: "text-base", children: "D\u1ECBch v\u1EE5 v\u1EADn chuy\u1EC3n" }), _jsxs("div", { className: "flex items-center gap-4", children: [renderStars(shippingRating, setShippingRating, hoveredShippingStar, setHoveredShippingStar), _jsx("span", { className: "text-sm font-medium text-primary", children: getRatingText(shippingRating) })] })] }), _jsxs("div", { className: "space-y-3 p-4 border border-border rounded-lg bg-muted/20", children: [_jsx(Label, { className: "text-base", children: "D\u1ECBch v\u1EE5 ng\u01B0\u1EDDi b\u00E1n" }), _jsxs("div", { className: "flex items-center gap-4", children: [renderStars(sellerRating, setSellerRating, hoveredSellerStar, setHoveredSellerStar), _jsx("span", { className: "text-sm font-medium text-primary", children: getRatingText(sellerRating) })] })] })] }), _jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [_jsx(Button, { variant: "outline", onClick: handleClose, children: "H\u1EE7y" }), _jsx(Button, { onClick: handleSubmit, disabled: comment.length === 0, children: "G\u1EEDi \u0111\u00E1nh gi\u00E1" })] })] }) }));
}
