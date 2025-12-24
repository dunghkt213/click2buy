/**
 * ProductDetailPage - Trang chi tiết sản phẩm
 * Hiển thị đầy đủ thông tin sản phẩm, shop, mô tả, đánh giá và sản phẩm liên quan
 */

import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Package, Share2, Shield, ShoppingCart, Sparkles, Star, Store, ThumbsUp, TruckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CartItem, Product, ProductReview } from 'types';
import { productApi } from '../../apis/product';
import { mapReviewResponse, reviewApi } from '../../apis/review';
import { BackendUser, userApi } from '../../apis/user';
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
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const app = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [shopInfo, setShopInfo] = useState<BackendUser | null>(null);
  const [loadingShop, setLoadingShop] = useState(false);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loadingShopProducts, setLoadingShopProducts] = useState(false);

  // Review pagination & filter
  const [reviewPage, setReviewPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  function clearSavedScrollPositionForPath(pathname: string) {
    try {
      const stored = sessionStorage.getItem('scrollPositions');
      if (!stored) return;
      const positions = JSON.parse(stored) as Record<string, number>;
      if (positions && typeof positions === 'object') {
        delete positions[pathname];
        sessionStorage.setItem('scrollPositions', JSON.stringify(positions));
      }
    } catch {
      return;
    }
  }

  // Load product khi page mount
  // Không scroll về đầu trang nữa, để useScrollRestoration xử lý
  useEffect(() => {
    if (id) {
      clearSavedScrollPositionForPath(location.pathname);
      window.scrollTo({ top: 0, behavior: 'auto' });
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 150);
      loadProduct();
      return () => clearTimeout(timeoutId);
    } else {
      toast.error('Không tìm thấy sản phẩm');
      navigate('/feed');
    }
  }, [id]);

  // Load reviews và shop info khi có product
  useEffect(() => {
    if (product?.id) {
      loadReviews();
      loadShopInfo();
      loadShopProducts();
    }
  }, [product?.id, product?.ownerId, product?.sellerId]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await productApi.getById(id);
      setProduct(data);
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Failed to load shop info:', error);
      setShopInfo(null);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadShopProducts = async () => {
    const shopId = product?.ownerId || product?.sellerId;
    if (!shopId) return;

    try {
      setLoadingShopProducts(true);
      const result = await productApi.getAll({ limit: 1000 });
      const filtered = result.products.filter(
        (p) => (p.ownerId === shopId || p.sellerId === shopId) && p.id !== product?.id
      );
      setShopProducts(filtered.slice(0, 12)); // Hiển thị tối đa 12 sản phẩm
    } catch (error) {
      console.error('Failed to load shop products:', error);
      setShopProducts([]);
    } finally {
      setLoadingShopProducts(false);
    }
  };

  const loadReviews = async () => {
    if (!product?.id) return;
    try {
      setLoadingReviews(true);
      const data = await reviewApi.findAll({ productId: product.id });
      const mappedReviews = data.map(mapReviewResponse);
      setReviews(mappedReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="p-12">
          <div className="text-center">
            <Package className="w-24 h-24 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-6">Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => navigate('/feed')}>Quay lại trang chủ</Button>
          </div>
        </Card>
      </div>
    );
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
  const paginatedReviews = filteredReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

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

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
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

    if (!product) return;

    // Convert product to CartItem
    const cartItem: CartItem = {
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

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header với nút quay lại */}
      <div className="sticky top-16 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Phần đầu: Ảnh, tên, giá, vận chuyển */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              <ImageWithFallback
                src={productImages[selectedImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isSale && (
                <Badge className="absolute top-4 left-4 bg-destructive">
                  -{discount}%
                </Badge>
              )}
              {product.isNew && (
                <Badge className="absolute top-4 right-4 bg-blue-500">Mới</Badge>
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
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImageIndex
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
            )}
          </div>

          {/* Right: Info */}
          <div>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

            {/* Rating & Sold */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-primary">
                  {product.ratingAvg || product.rating || 0}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= (product.ratingAvg || product.rating || 0)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                        }`}
                    />
                  ))}
                </div>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">
                {reviews.length.toLocaleString()} Đánh giá
              </span>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-muted-foreground">
                {soldCount.toLocaleString()} Đã bán
              </span>
            </div>

            {/* Price */}
            <div className="bg-muted/50 p-6 rounded-lg mb-6">
              <div className="flex items-baseline gap-3">
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    ₫{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-4xl font-bold text-primary">
                  ₫{product.price.toLocaleString()}
                </span>
                {product.isSale && (
                  <Badge variant="destructive" className="ml-2 text-sm">
                    -{discount}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <TruckIcon className="w-5 h-5 text-primary" />
                <span>Miễn phí vận chuyển cho đơn từ 500.000đ</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary" />
                <span>Bảo hành chính hãng 12 tháng</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Package className="w-5 h-5 text-primary" />
                <span>Đổi trả miễn phí trong 7 ngày</span>
              </div>
            </div>

            {/* Brand & Stock */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-32">Thương hiệu:</span>
                <span className="text-sm font-medium">{product.brand}</span>
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
                className="flex-1 gap-2 text-black h-12"
                onClick={(e) => handleAddToCart(e)}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                className="flex-1 gap-2 h-12"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                Mua ngay
              </Button>
            </div>

            {/* Share */}
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </Button>
          </div>
        </div>

        {/* Khung shop info */}
        {shopId && (
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Shop Avatar */}
              <Avatar className="w-20 h-20">
                {shopInfo?.avatar ? (
                  <ImageWithFallback
                    src={shopInfo.avatar}
                    alt={shopInfo.shopName || 'Shop'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
                    <Store className="w-10 h-10" />
                  </div>
                )}
              </Avatar>

              {/* Shop Info */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => navigate(`/shop?ownerId=${shopId}`)}
                  className="text-xl font-semibold hover:text-primary transition-colors mb-1"
                >
                  {loadingShop
                    ? 'Đang tải...'
                    : shopInfo?.shopName || product.brand || 'Shop Đối tác'}
                </button>
                <div className="flex items-center gap-4 flex-wrap mt-2">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.8</span>
                  </div>
                  {/* Product Count */}
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {loadingShopProducts ? '...' : shopProducts.length} sản phẩm
                    </span>
                  </div>
                  {/* Join Date */}
                  {shopJoinDate && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        Tham gia: {shopJoinDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shop Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/shop?ownerId=${shopId}`)}
                >
                  Xem shop
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
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
                    } else {
                      toast.error('Không tìm thấy thông tin shop');
                    }
                  }}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat với shop
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Chi tiết sản phẩm */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h2>
          <div className="space-y-3">
            {Object.entries(specifications).map(([key, value]) => (
              <div key={key} className="flex py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground w-1/3">{key}</span>
                <span className="text-sm flex-1">{String(value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Mô tả sản phẩm */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h2>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </Card>

        {/* Đánh giá sản phẩm */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Đánh giá sản phẩm</h2>

          {/* Rating Summary */}
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {product.ratingAvg || product.rating || 0}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= (product.ratingAvg || product.rating || 0)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reviews.length.toLocaleString()} đánh giá
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedRating(item.stars === selectedRating ? null : item.stars);
                        setReviewPage(1);
                      }}
                      className={`flex items-center gap-2 text-sm transition-colors ${selectedRating === item.stars
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-primary'
                        }`}
                    >
                      <span className="w-12">{item.stars} sao</span>
                      <Progress value={item.percentage} className="flex-1 h-2" />
                      <span className="w-12 text-right">{item.count}</span>
                    </button>
                  </div>
                ))}
                {selectedRating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRating(null);
                      setReviewPage(1);
                    }}
                    className="mt-2"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* AI Review Summary */}
          {product.reviewSummary && (
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10 mb-6">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Tóm tắt đánh giá (AI)</h3>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {product.reviewSummary}
                </p>
              </div>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {loadingReviews ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải đánh giá...
              </div>
            ) : paginatedReviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {selectedRating
                  ? `Chưa có đánh giá ${selectedRating} sao`
                  : 'Chưa có đánh giá nào cho sản phẩm này'}
              </div>
            ) : (
              paginatedReviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      {review.userAvatar ? (
                        <ImageWithFallback
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm font-medium">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.userName}</span>
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
                              className={`w-3 h-3 ${star <= review.rating
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
                          {review.images.map((img, idx) => {
                            // Convert Google Drive URL to displayable format
                            const convertGoogleDriveUrl = (url: string): string => {
                              if (!url || typeof url !== 'string') return url;

                              const trimmedUrl = url.trim();
                              let fileId: string | null = null;

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

                            return (
                              <div
                                key={idx}
                                className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(img, '_blank')}
                              >
                                <ImageWithFallback
                                  src={convertedUrl}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                disabled={reviewPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={reviewPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReviewPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={reviewPage === totalPages}
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>

        {/* Sản phẩm khác của shop */}
        {shopProducts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Sản phẩm khác của {shopInfo?.shopName || 'shop'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {shopProducts.map((shopProduct) => (
                <ProductCard
                  key={shopProduct.id}
                  product={shopProduct}
                  onAddToCart={app.addToCart}
                  onViewDetail={(p) => {
                    const nextPath = `/product/${p.id}`;
                    clearSavedScrollPositionForPath(nextPath);
                    navigate(nextPath);
                  }}
                  onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
                  isLoggedIn={app.isLoggedIn}
                  onLogin={app.handleLogin}
                />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Flying Icon Animation */}
      {app.flyingIcons && app.flyingIcons.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Flying icons sẽ được render bởi AppLayout */}
        </div>
      )}
    </div>
  );
}

