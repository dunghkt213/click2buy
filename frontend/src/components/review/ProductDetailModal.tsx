import { ChevronLeft, ChevronRight, Package, Share2, Shield, ShoppingCart, Star, Store, ThumbsUp, TruckIcon, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Product, ProductReview, CartItem } from 'types';
import { mapReviewResponse, reviewApi } from '../../apis/review';
import { userApi, BackendUser } from '../../apis/user';
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

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose?: () => void;
  product: Product;
  onAddToCart: (product: Product) => void;
  onTriggerFlyingIcon?: (type: 'cart', element: HTMLElement) => void; // THÊM: Trigger flying animation
  isLoggedIn?: boolean; // THÊM: Kiểm tra đăng nhập
  onLogin?: () => void; // THÊM: Callback để mở modal đăng nhập
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onTriggerFlyingIcon,
  isLoggedIn = false,
  onLogin,
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [shopInfo, setShopInfo] = useState<BackendUser | null>(null);
  const [loadingShop, setLoadingShop] = useState(false);
  
  // Comment form state
  const [commentRating, setCommentRating] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [commentImagePreviews, setCommentImagePreviews] = useState<string[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    } catch (error) {
      console.error('Failed to load shop info:', error);
      setShopInfo(null);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewApi.findAll({ productId: product.id });
      const mappedReviews = data.map(mapReviewResponse);
      setReviews(mappedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      // Fallback to empty array if API fails
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handlers cho comment form
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...commentImages, ...files].slice(0, 5); // Tối đa 5 ảnh
      setCommentImages(newFiles);
      
      // Tạo preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setCommentImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
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
      const uploadedImageUrls: string[] = [];
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
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      toast.error('Không thể thêm bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!isOpen || !product) return null;

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
    'Tình trạng': product.inStock ? 'Còn hàng' : 'Hết hàng',
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
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
    const cartItem: CartItem = {
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

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      console.error('ProductDetailModal: onClose is not a function', { onClose });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Đóng modal khi click vào overlay (background)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg">Chi tiết sản phẩm</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-8 h-8 p-0 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <ScrollArea className="h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* Product Main Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left: Images */}
              <div>
                {/* Main Image */}
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                  <ImageWithFallback
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.isSale && (
                    <Badge className="absolute top-4 left-4 bg-destructive">
                      -{discount}%
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge className="absolute top-4 right-4 bg-blue-500">
                      Mới
                    </Badge>
                  )}
                  
                  {/* Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Info */}
              <div>
                <h1 className="text-2xl mb-2">{product.name}</h1>
                
                {/* Shop Name */}
                {(product.ownerId || product.sellerId) && (
                  <div className="mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const shopId = product.ownerId || product.sellerId;
                        if (shopId) {
                          // Đóng modal trước khi navigate
                          if (onClose) {
                            onClose();
                          }
                          navigate(`/shop?ownerId=${shopId}`);
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors group"
                      disabled={loadingShop}
                    >
                      <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">
                        {loadingShop 
                          ? 'Đang tải...' 
                          : shopInfo?.shopName 
                            ? `Shop ${shopInfo.shopName}` 
                            : product.brand 
                              ? `Shop ${product.brand}` 
                              : 'Shop Đối tác'}
                      </span>
                    </button>
                  </div>
                )}
                
                {/* Rating & Sold */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-primary">{product.rating}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= product.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {product.reviews.toLocaleString()} Đánh giá
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {soldCount.toLocaleString()} Đã bán
                  </span>
                </div>

                {/* Price */}
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <div className="flex items-baseline gap-3">
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₫{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl text-primary">
                      ₫{product.price.toLocaleString()}
                    </span>
                    {product.isSale && (
                      <Badge variant="destructive" className="ml-2">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Brand & Stock */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-32">Thương hiệu:</span>
                    <span className="text-sm">{product.brand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-32">Tình trạng:</span>
                    <Badge variant={product.inStock ? 'default' : 'secondary'}>
                      {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </Badge>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground block mb-2">Số lượng:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0 rounded-none"
                      >
                        -
                      </Button>
                      <span className="w-12 text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        className="h-10 w-10 p-0 rounded-none"
                      >
                        +
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-black"
                    onClick={(e) => handleAddToCart(e)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  >
                    Mua ngay
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-2">
                    <Share2 className="w-4 h-4" />
                    Chia sẻ
                  </Button>
                </div>

                {/* Guarantees */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Bảo hành chính hãng 12 tháng</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-primary" />
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <TruckIcon className="w-5 h-5 text-primary" />
                    <span>Miễn phí vận chuyển cho đơn từ 500.000đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Thông số kỹ thuật
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Đánh giá ({product.reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="py-6">
                <div className="prose prose-sm max-w-none">
                  <p>{product.description}</p>

                </div>
              </TabsContent>

              <TabsContent value="specifications" className="py-6">
                <div className="space-y-3">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground w-1/3">{key}</span>
                      <span className="text-sm flex-1">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="py-6">
                {/* Rating Summary */}
                <div className="bg-muted/30 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-5xl mb-2">{product.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= product.rating
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {product.reviews.toLocaleString()} đánh giá
                      </p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {ratingBreakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3">
                          <span className="text-sm w-12">{item.stars} sao</span>
                          <Progress value={item.percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Comment Form */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h3>
                  
                  {!isLoggedIn ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để viết đánh giá</p>
                      <Button onClick={onLogin}>Đăng nhập</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Rating Selection */}
                      <div>
                        <Label className="mb-2 block">Đánh giá của bạn</Label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setCommentRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= commentRating
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground/30 hover:text-primary/50'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-muted-foreground">
                            {commentRating} sao
                          </span>
                        </div>
                      </div>

                      {/* Comment Text */}
                      <div>
                        <Label htmlFor="comment-text" className="mb-2 block">
                          Bình luận
                        </Label>
                        <Textarea
                          id="comment-text"
                          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-24"
                          rows={4}
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label className="mb-2 block">Thêm ảnh (tối đa 5 ảnh)</Label>
                        <div className="space-y-3">
                          {/* Image Previews */}
                          {commentImagePreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                              {commentImagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full aspect-square object-cover rounded-lg border border-border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Upload Button */}
                          {commentImages.length < 5 && (
                            <div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Thêm ảnh
                                {commentImages.length > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    ({commentImages.length}/5)
                                  </span>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={isSubmittingComment || (commentText.trim() === '' && commentImages.length === 0)}
                          className="gap-2"
                        >
                          {isSubmittingComment ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {loadingReviews ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Đang tải đánh giá...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Chưa có đánh giá nào cho sản phẩm này
                    </div>
                  ) : (
                    reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          {review.userAvatar ? (
                            <ImageWithFallback src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{review.userName}</span>
                            {review.isVerifiedPurchase && (
                              <Badge variant="outline" className="text-xs">
                                Đã mua hàng
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating
                                      ? 'fill-primary text-primary'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                          <p className="text-sm mb-3">{review.comment}</p>
                          
                          {/* Review Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {review.images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(img, '_blank')}
                                >
                                  <ImageWithFallback
                                    src={img}
                                    alt={`Review image ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <Button variant="ghost" size="sm" className="gap-2 h-8">
                            <ThumbsUp className="w-3 h-3" />
                            Hữu ích ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}