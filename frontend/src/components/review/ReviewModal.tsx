import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Image as ImageIcon, Star, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { formatPrice } from '../../lib/utils';
import { Order } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmitReview: (reviewData: ReviewData) => void;
}

export interface ReviewData {
  orderId: string;
  productRating: number;
  shippingRating: number;
  sellerRating: number;
  comment: string;
  images: File[];
  videos: File[];
  isAnonymous: boolean;
}

export function ReviewModal({
  isOpen,
  onClose,
  order,
  onSubmitReview,
}: ReviewModalProps) {
  const [productRating, setProductRating] = useState(5);
  const [shippingRating, setShippingRating] = useState(5);
  const [sellerRating, setSellerRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [hoveredProductStar, setHoveredProductStar] = useState<number | null>(null);
  const [hoveredShippingStar, setHoveredShippingStar] = useState<number | null>(null);
  const [hoveredSellerStar, setHoveredSellerStar] = useState<number | null>(null);

  if (!order) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    setImages(prev => [...prev, ...newImages]);

    // Create previews
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newVideos = Array.from(files);
    setVideos(prev => [...prev, ...newVideos]);

    // Create previews
    newVideos.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const reviewData: ReviewData = {
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

  const renderStars = (
    rating: number,
    setRating: (rating: number) => void,
    hoveredStar: number | null,
    setHoveredStar: (star: number | null) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredStar || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tóm tắt đơn hàng */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="shrink-0">
                {order.orderNumber}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">
                        x{item.quantity}
                      </span>
                      <span className="font-medium text-primary">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Đánh giá chất lượng sản phẩm */}
          <div className="space-y-3">
            <Label className="text-base">Chất lượng sản phẩm</Label>
            <div className="flex items-center gap-4">
              {renderStars(
                productRating,
                setProductRating,
                hoveredProductStar,
                setHoveredProductStar
              )}
              <span className="text-sm font-medium text-primary">
                {getRatingText(productRating)}
              </span>
            </div>
          </div>

          {/* Phần nhận xét */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base">
              Nhận xét về sản phẩm
            </Label>
            <Textarea
              id="comment"
              placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Thêm hình ảnh và video */}
          <div className="space-y-3">
            <Label className="text-base">Thêm hình ảnh/video (Tùy chọn)</Label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group border border-border">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Previews */}
            {videoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {videoPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group bg-black border border-border">
                    <video
                      src={preview}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Video className="w-8 h-8 text-white/70" />
                    </div>
                    <button
                      onClick={() => removeVideo(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Thêm hình ảnh
                </Label>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="video-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Thêm video
                </Label>
              </div>
            </div>
          </div>

          {/* Tùy chọn ẩn danh */}
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg bg-muted/30">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <Label
              htmlFor="anonymous"
              className="text-sm cursor-pointer select-none"
            >
              Hiển thị tên tài khoản ẩn danh
            </Label>
          </div>

          {/* Đánh giá vận chuyển */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
            <Label className="text-base">Dịch vụ vận chuyển</Label>
            <div className="flex items-center gap-4">
              {renderStars(
                shippingRating,
                setShippingRating,
                hoveredShippingStar,
                setHoveredShippingStar
              )}
              <span className="text-sm font-medium text-primary">
                {getRatingText(shippingRating)}
              </span>
            </div>
          </div>

          {/* Đánh giá người bán */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
            <Label className="text-base">Dịch vụ người bán</Label>
            <div className="flex items-center gap-4">
              {renderStars(
                sellerRating,
                setSellerRating,
                hoveredSellerStar,
                setHoveredSellerStar
              )}
              <span className="text-sm font-medium text-primary">
                {getRatingText(sellerRating)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={comment.length === 0}>
            Gửi đánh giá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}