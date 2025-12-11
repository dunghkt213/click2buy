import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Share2, ThumbsUp, ChevronLeft, ChevronRight, Package, Shield, TruckIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Product, ProductReview } from 'types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onAddToWishlist,
}: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  // Mock data cho nhiều ảnh sản phẩm
  const productImages = product.images || [product.image, product.image, product.image];

  // Mock data cho đánh giá chi tiết
  const ratingBreakdown = [
    { stars: 5, count: 1250, percentage: 75 },
    { stars: 4, count: 280, percentage: 17 },
    { stars: 3, count: 83, percentage: 5 },
    { stars: 2, count: 33, percentage: 2 },
    { stars: 1, count: 17, percentage: 1 },
  ];

  // Mock data cho reviews
  const mockReviews: ProductReview[] = [
    {
      id: '1',
      userId: 'u1',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      rating: 5,
      comment: 'Sản phẩm rất tốt, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Tôi rất hài lòng với sản phẩm này!',
      date: '2024-01-15',
      helpful: 24,
      isVerifiedPurchase: true,
    },
    {
      id: '2',
      userId: 'u2',
      userName: 'Trần Thị B',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      rating: 4,
      comment: 'Chất lượng tốt, giá cả hợp lý. Chỉ tiếc là màu sắc hơi khác so với hình ảnh một chút.',
      date: '2024-01-12',
      helpful: 15,
      isVerifiedPurchase: true,
    },
    {
      id: '3',
      userId: 'u3',
      userName: 'Lê Văn C',
      userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      rating: 5,
      comment: 'Tuyệt vời! Đã mua lần 2 rồi, sẽ tiếp tục ủng hộ shop.',
      date: '2024-01-10',
      helpful: 8,
      isVerifiedPurchase: true,
    },
  ];

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

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  const soldCount = product.soldCount || Math.floor(Math.random() * 10000);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg">Chi tiết sản phẩm</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-full"
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
                  <img
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
                      <img
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
                    <span className="text-sm text-muted-foreground w-32">Số lượng còn lại:</span>
                    <span className="text-sm font-medium">
                      {typeof product.stock === 'number' ? `${product.stock} sản phẩm` : '0 sản phẩm'}
                    </span>
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
                      {typeof product.stock === 'number' ? `Còn ${product.stock} sản phẩm` : '0 sản phẩm'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mb-6">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ hàng
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    Mua ngay
                  </Button>
                </div>

                {/* Additional Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => onAddToWishlist?.(product)}
                  >
                    <Heart className="w-4 h-4" />
                    Yêu thích
                  </Button>
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
                  <p className="mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
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

                {/* Reviews List */}
                <div className="space-y-6">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <img src={review.userAvatar} alt={review.userName} />
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
                          <Button variant="ghost" size="sm" className="gap-2 h-8">
                            <ThumbsUp className="w-3 h-3" />
                            Hữu ích ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}