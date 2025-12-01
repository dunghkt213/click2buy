import { Clock, Eye, Flame, Heart, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Product } from 'types';
import { productApi } from '../../lib/productApi';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface HotDealsSectionProps {
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  onTriggerFlyingIcon?: (type: 'heart' | 'cart', element: HTMLElement) => void;
  isLoggedIn?: boolean; // THÊM: Kiểm tra đăng nhập
  onLogin?: () => void; // THÊM: Callback để mở modal đăng nhập
}

export function HotDealsSection({
  onAddToCart,
  onViewDetail,
  onAddToWishlist,
  isInWishlist,
  onTriggerFlyingIcon,
  isLoggedIn = false,
  onLogin
}: HotDealsSectionProps) {
  const [hotDeals, setHotDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load hot deals products từ API
  useEffect(() => {
    loadHotDeals();
  }, []);

  const loadHotDeals = async () => {
    try {
      setLoading(true);
      // Load products với filter isSale hoặc isBestSeller
      const products = await productApi.getAll({
        // Có thể filter theo category hoặc các tiêu chí khác
      });
      // Filter để lấy các sản phẩm có sale hoặc best seller
      const deals = products
        .filter(p => p.isSale || p.isBestSeller)
        .slice(0, 4); // Lấy 4 sản phẩm đầu tiên
      setHotDeals(deals);
    } catch (error: any) {
      console.error('Failed to load hot deals:', error);
      toast.error('Không thể tải sản phẩm hot deals');
      // Fallback to empty array
      setHotDeals([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (!isLoggedIn) {
      e.preventDefault();
      e.stopPropagation();
      onLogin?.();
      return;
    }
    
    onAddToCart(product);
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('cart', e.currentTarget);
    }
  };

  const handleAddToWishlist = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      e.stopPropagation();
      onLogin?.();
      return;
    }
    
    onAddToWishlist(product);
    if (onTriggerFlyingIcon) {
      onTriggerFlyingIcon('heart', e.currentTarget);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Hot Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotDeals.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Discount Badge */}
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                -{product.discount}%
              </div>

              {/* Timer Badge */}
              <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {product.timeLeft}
              </div>

              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Quick Actions - Appear on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => onViewDetail(product)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`bg-white/90 hover:bg-white ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
                    onClick={(e) => handleAddToWishlist(product, e)}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Brand */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {product.brand}
                  </Badge>
                  {product.isBestSeller && (
                    <Badge className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                      Bán chạy
                    </Badge>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-medium line-clamp-2 min-h-[3rem]">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({product.reviews.toLocaleString()})</span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-red-500">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {product.originalPrice?.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                {/* Progress Bar - Sold Quantity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Đã bán 234</span>
                    <span>Còn lại 66</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Mua ngay
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg" className="gap-2">
            Xem tất cả Flash Sale
            <Flame className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
