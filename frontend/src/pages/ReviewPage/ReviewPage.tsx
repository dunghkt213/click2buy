/**
 * ReviewPage - Trang đánh giá sản phẩm
 * Hiển thị thông tin sản phẩm, các đánh giá trước đó, và form đánh giá mới
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../providers/AppProvider';
import { toast } from 'sonner';

// UI Components
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

// Icons
import {
  ArrowLeft,
  Star,
  Image as ImageIcon,
  X,
  Package,
  DollarSign,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';

// Types & Utils
import { Order, ProductReview, Product } from '../../types';
import { formatPrice } from '../../utils/utils';
import { reviewService } from '../../apis/review';
import { productService } from '../../apis/product';
import { mediaApi } from '../../apis/media';
import { mapReviewResponse } from '../../apis/review/review.mapper';

export function ReviewPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const app = useAppContext();

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

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
        let foundOrder = app.orders.orders.find((o: Order) => o.id === orderId);
        
        // If not found, try to load from API
        if (!foundOrder) {
          // Try to load all orders for user (without status filter to get all)
          await app.orders.loadOrdersForUser();
          foundOrder = app.orders.orders.find((o: Order) => o.id === orderId);
        }

        if (!foundOrder) {
          toast.error('Không tìm thấy đơn hàng');
          navigate('/orders');
          return;
        }

        setOrder(foundOrder);

        // Load product details (lấy product đầu tiên trong order)
        if (foundOrder.items && foundOrder.items.length > 0) {
          const firstItem = foundOrder.items[0];
          const productId = firstItem.productId || firstItem.id;
          
          try {
            const productData = await productService.getById(productId);
            setProduct(productData);
            
            // Load reviews for this product
            const reviewsData = await reviewService.findAll({ productId: productData.id });
            const mappedReviews = reviewsData.map(mapReviewResponse);
            setReviews(mappedReviews);
          } catch (error) {
            console.error('Error loading product:', error);
          }
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [orderId, app.isLoggedIn, app.orders.orders, navigate]);

  // Handle image upload
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!order || !product) return;

    if (comment.trim().length === 0) {
      toast.error('Vui lòng nhập đánh giá');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const imageFile of images) {
        try {
          const response = await mediaApi.upload(imageFile);
          const imageUrl = response?.url?.thumbnailUrl || '';
          if (imageUrl) {
            imageUrls.push(imageUrl);
          }
        } catch (error) {
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
      setUploadedImageUrls([]);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars
  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void, interactive: boolean = true) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(null)}
            disabled={!interactive}
            className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (interactive ? (hoveredStar || currentRating) : currentRating)
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
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Bình thường';
      case 4: return 'Tốt';
      case 5: return 'Rất tốt';
      default: return '';
    }
  };

  // Convert Google Drive URL to displayable format
  const convertGoogleDriveUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return url;
    
    const trimmedUrl = url.trim();
    
    // Extract file ID from various Google Drive URL formats
    let fileId: string | null = null;
    
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
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!order || !product) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy đơn hàng hoặc sản phẩm</p>
          <Button onClick={() => navigate('/orders')}>Quay lại</Button>
        </Card>
      </div>
    );
  }

  const orderItem = order.items[0]; // Lấy sản phẩm đầu tiên để đánh giá

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Đánh giá sản phẩm</h1>
              <p className="text-sm text-muted-foreground mt-1">Chia sẻ trải nghiệm của bạn về sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Info & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info Card */}
            <Card className="p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted shrink-0 border">
                  <ImageWithFallback
                    src={orderItem.image || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2">{product.name}</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Mã đơn: {order.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày mua: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold text-primary">{formatPrice(orderItem.price)}</span>
                    </div>
                    {orderItem.variant && (
                      <Badge variant="outline" className="w-fit">
                        {orderItem.variant}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Previous Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Đánh giá từ người mua khác</h3>
              <ScrollArea className="h-[400px] pr-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {review.userName || 'Người dùng'}
                              </span>
                              {review.isVerifiedPurchase && (
                                <Badge variant="outline" className="text-xs">Đã mua</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(review.rating, () => {}, false)}
                              <span className="text-xs text-muted-foreground">
                                {review.updatedAt 
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
                                    })
                                }
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words">
                                {review.comment}
                              </p>
                            )}
                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-3 mt-3">
                                {review.images.map((img, idx) => {
                                  const convertedUrl = convertGoogleDriveUrl(img);
                                  return (
                                    <div 
                                      key={idx} 
                                      className="relative w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity group"
                                      onClick={() => window.open(img, '_blank')}
                                      title="Nhấn để xem ảnh lớn"
                                    >
                                      <ImageWithFallback
                                        src={convertedUrl}
                                        alt={`Review image ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>

          {/* Right Column - Review Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6">Đánh giá của bạn</h3>

              <div className="space-y-6">
                {/* Rating */}
                <div className="space-y-3">
                  <Label className="text-base">Đánh giá sản phẩm</Label>
                  <div className="flex items-center gap-4">
                    {renderStars(rating, setRating, true)}
                    <span className="text-sm font-medium text-primary">
                      {getRatingText(rating)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Comment */}
                <div className="space-y-3">
                  <Label htmlFor="comment" className="text-base">
                    Nhận xét về sản phẩm
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="resize-none break-all whitespace-pre-wrap"
                  />
                  <p className="text-xs text-muted-foreground">
                    {comment.length}/500 ký tự
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label className="text-base">Thêm hình ảnh (Tùy chọn)</Label>
                  
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden group border">
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
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors w-full justify-center"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Thêm hình ảnh
                    </Label>
                  </div>
                </div>

                <Separator />

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || comment.trim().length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi đánh giá'
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

