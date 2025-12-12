import { Clock, Flame, ShoppingCart } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CartItem, Product } from 'types';
import { productApi } from '../../apis/product';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface HotDealsSectionProps {
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  onTriggerFlyingIcon?: (type: 'cart', element: HTMLElement) => void;
  isLoggedIn?: boolean; // THÊM: Kiểm tra đăng nhập
  onLogin?: () => void; // THÊM: Callback để mở modal đăng nhập
}

export function HotDealsSection({
  onAddToCart,
  onViewDetail,
  onTriggerFlyingIcon,
  isLoggedIn = false,
  onLogin
}: HotDealsSectionProps) {
  const navigate = useNavigate();
  const [allHotDeals, setAllHotDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionHeaderRef = useRef<HTMLDivElement>(null);

  // Tính discount percentage từ originalPrice và price
  const calculateDiscount = (originalPrice: number, price: number): number => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Load hot deals products từ API
  useEffect(() => {
    loadHotDeals();
  }, []);

  const loadHotDeals = async () => {
    try {
      setLoading(true);
      // Load products với filter isSale hoặc isBestSeller
      const products = await productApi.getAll({
        limit: 40,
        // Có thể filter theo category hoặc các tiêu chí khác
      });
      // Filter và sort các sản phẩm có sale theo discount giảm dần
      const dealsWithDiscount = products
        .filter(p => p.isSale && p.originalPrice && p.originalPrice > p.price)
        .map(p => ({
          ...p,
          discount: calculateDiscount(p.originalPrice!, p.price)
        }))
        .sort((a, b) => (b.discount || 0) - (a.discount || 0)); // Sort theo discount giảm dần
      
      setAllHotDeals(dealsWithDiscount);
    } catch (error: any) {
      console.error('Failed to load hot deals:', error);
      toast.error('Không thể tải sản phẩm hot deals');
      // Fallback to empty array
      setAllHotDeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy sản phẩm để hiển thị: 8 sản phẩm khi collapse, 72 sản phẩm (9 hàng x 8) khi expand
  const displayedProducts = isExpanded 
    ? allHotDeals.slice(0, 72) // 9 hàng x 8 cột = 72 sản phẩm
    : allHotDeals.slice(0, 8); // 1 hàng x 8 cột = 8 sản phẩm

  // Mock hot deals products (fallback)
  const mockHotDeals: Product[] = [
    {
      id: 'hot-1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 28990000,
      originalPrice: 34990000,
      discount: 17,
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500',
      category: 'electronics',
      rating: 4.9,
      reviews: 2543,
      description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ',
      brand: 'Apple',
      inStock: true,
      isBestSeller: true,
      timeLeft: '2 giờ 15 phút'
    },
    {
      id: 'hot-2',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      price: 29990000,
      originalPrice: 35990000,
      discount: 17,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
      category: 'electronics',
      rating: 4.8,
      reviews: 1876,
      description: 'Galaxy S24 Ultra với camera 200MP',
      brand: 'Samsung',
      inStock: true,
      isBestSeller: true,
      timeLeft: '3 giờ 42 phút'
    },
    {
      id: 'hot-3',
      name: 'MacBook Air M3 15 inch 256GB',
      price: 32990000,
      originalPrice: 39990000,
      discount: 18,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      category: 'electronics',
      rating: 4.9,
      reviews: 3214,
      description: 'MacBook Air M3 siêu mỏng nhẹ',
      brand: 'Apple',
      inStock: true,
      isBestSeller: true,
      timeLeft: '5 giờ 20 phút'
    },
    {
      id: 'hot-4',
      name: 'Sony WH-1000XM5 Chống ồn',
      price: 6990000,
      originalPrice: 8990000,
      discount: 22,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
      category: 'electronics',
      rating: 4.8,
      reviews: 1543,
      description: 'Tai nghe chống ồn hàng đầu',
      brand: 'Sony',
      inStock: true,
      isBestSeller: true,
      timeLeft: '1 giờ 35 phút'
    }
  ];

  const handleAddToCart = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Ngăn không cho trigger xem chi tiết
    
    if (!isLoggedIn) {
      e.preventDefault();
      onLogin?.();
      return;
    }
    
    onAddToCart(product);
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('cart', e.currentTarget);
    }
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Ngăn không cho trigger xem chi tiết
    
    if (!isLoggedIn) {
      e.preventDefault();
      onLogin?.();
      return;
    }

    // Convert product to CartItem
    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selected: true,
    };

    // Navigate to checkout with product
    navigate('/checkout', {
      state: {
        items: [cartItem],
      },
    });
  };

  // Handler để xem chi tiết sản phẩm khi click vào card
  const handleCardClick = (product: Product) => {
    onViewDetail(product);
  };


  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={sectionHeaderRef} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Flash Sale Hôm Nay</h2>
              <p className="text-muted-foreground">Giảm giá cực sốc, số lượng có hạn</p>
            </div>
          </div>
          
          {/* Countdown Timer */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-bold">Kết thúc sau: 05:42:18</span>
          </div>
        </div>

        {/* Hot Deals Grid - 8 cột trên desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card border border-border rounded-md overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              onClick={() => handleCardClick(product)}
            >
              {/* Discount Badge */}
              <div className="absolute top-1 left-1 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                -{product.discount || calculateDiscount(product.originalPrice || 0, product.price)}%
              </div>

              {/* Timer Badge */}
              {product.timeLeft && (
                <div className="absolute top-1 right-1 z-10 bg-black/70 backdrop-blur-sm text-white px-1 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                  <Clock className="w-2 h-2" />
                  <span className="text-[10px]">{product.timeLeft}</span>
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-1.5 space-y-1">
                {/* Brand */}
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                    {product.brand}
                  </Badge>
                  {product.isBestSeller && (
                    <Badge className="text-[10px] bg-yellow-500/10 text-yellow-700 border-yellow-500/20 px-1 py-0 h-4">
                      Bán chạy
                    </Badge>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-medium line-clamp-2 text-xs min-h-[2rem] leading-tight">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 text-[10px]">
                  <div className="flex items-center gap-0.5">
                    <span className="text-yellow-500 text-[10px]">★</span>
                    <span className="font-medium text-[10px]">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px]">({product.reviews > 999 ? '999+' : product.reviews})</span>
                </div>

                {/* Price */}
                <div className="space-y-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-red-500">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {product.originalPrice && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar - Sold Quantity */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Đã bán</span>
                    <span>234</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>

                {/* Buy Now Button */}
                <Button
                  className="w-full gap-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-[10px] h-6 px-1"
                  onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleBuyNow(product, e)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-2.5 h-2.5" />
                  <span className="text-[10px]">Mua ngay</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Expand/Collapse Button */}
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            onClick={() => {
              const wasExpanded = isExpanded;
              setIsExpanded(!isExpanded);
              
              // Nếu đang thu gọn (từ expanded về collapsed), cuộn lên header
              if (wasExpanded && sectionHeaderRef.current) {
                setTimeout(() => {
                  const headerOffset = 80; // Offset cho fixed header
                  const elementPosition = sectionHeaderRef.current?.getBoundingClientRect().top;
                  const offsetPosition = (elementPosition || 0) + window.pageYOffset - headerOffset;
                  
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }, 100); // Delay nhỏ để state update xong
              }
            }}
          >
            {isExpanded ? (
              <>
                Thu gọn
                <Flame className="w-4 h-4" />
              </>
            ) : (
              <>
                Xem tất cả Flash Sale
                <Flame className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
