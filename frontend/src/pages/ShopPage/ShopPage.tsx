/**
 * ShopPage - Trang cửa hàng
 * Hiển thị thông tin shop, giới thiệu và các sản phẩm của shop
 */

import { Search, Star, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FlyingIcon } from '../../components/animation/FlyingIcon';
import { ProductCard } from '../../components/product/ProductCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { useAppContext } from '../../providers/AppProvider';
import { Product } from '../../types';

// Mock data cho shop
const mockShopInfo = {
  id: 'shop-1',
  name: 'TechStore Pro',
  avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
  description: 'Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá tốt nhất thị trường. Chúng tôi cam kết chất lượng và dịch vụ tốt nhất cho khách hàng.',
  rating: 4.8,
  totalReviews: 1250,
  totalProducts: 156,
  followers: 8500,
  joinedDate: '2023-01-15',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  phone: '0901234567',
  email: 'contact@techstorepro.com',
};

// Mock products cho shop
const mockShopProducts: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 28990000,
    originalPrice: 34990000,
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500',
    category: 'electronics',
    rating: 4.9,
    reviews: 2543,
    description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ',
    brand: 'Apple',
    inStock: true,
    isSale: true,
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    price: 29990000,
    originalPrice: 35990000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    category: 'electronics',
    rating: 4.8,
    reviews: 1876,
    description: 'Galaxy S24 Ultra với camera 200MP',
    brand: 'Samsung',
    inStock: true,
    isSale: true,
    isBestSeller: true,
  },
  {
    id: 'p3',
    name: 'MacBook Air M3 15 inch 256GB',
    price: 32990000,
    originalPrice: 39990000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    category: 'electronics',
    rating: 4.9,
    reviews: 3214,
    description: 'MacBook Air M3 siêu mỏng nhẹ',
    brand: 'Apple',
    inStock: true,
    isSale: true,
    isNew: true,
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5 Chống ồn',
    price: 6990000,
    originalPrice: 8990000,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500',
    category: 'electronics',
    rating: 4.8,
    reviews: 1543,
    description: 'Tai nghe chống ồn hàng đầu',
    brand: 'Sony',
    inStock: true,
    isSale: true,
  },
  {
    id: 'p5',
    name: 'iPad Pro 12.9 inch M2',
    price: 24990000,
    originalPrice: 29990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    category: 'electronics',
    rating: 4.7,
    reviews: 987,
    description: 'iPad Pro với chip M2 mạnh mẽ',
    brand: 'Apple',
    inStock: true,
    isSale: true,
  },
  {
    id: 'p6',
    name: 'Dell XPS 13 Plus',
    price: 35990000,
    originalPrice: 41990000,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
    category: 'electronics',
    rating: 4.6,
    reviews: 654,
    description: 'Laptop siêu mỏng nhẹ Dell XPS',
    brand: 'Dell',
    inStock: true,
    isSale: true,
  },
];

export function ShopPage() {
  const app = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scroll về đầu trang khi vào trang shop
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Filter products based on search
  const filteredProducts = mockShopProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Shop Header Section */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Avatar and Name */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative mb-4">
                <img
                  src={mockShopInfo.avatar}
                  alt={mockShopInfo.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-center md:text-left">
                {mockShopInfo.name}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{mockShopInfo.rating}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  {mockShopInfo.totalReviews.toLocaleString()} đánh giá
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  {mockShopInfo.totalProducts} sản phẩm
                </span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {mockShopInfo.followers.toLocaleString()} người theo dõi
              </Badge>
            </div>

            {/* Right: Shop Introduction */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Giới thiệu cửa hàng</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {mockShopInfo.description}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <p className="font-medium mt-1">{mockShopInfo.address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Liên hệ:</span>
                  <p className="font-medium mt-1">{mockShopInfo.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium mt-1">{mockShopInfo.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tham gia:</span>
                  <p className="font-medium mt-1">
                    {new Date(mockShopInfo.joinedDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm trong cửa hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Xóa
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              Tìm thấy {filteredProducts.length} sản phẩm cho "{searchQuery}"
            </p>
          )}
        </div>

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Sản phẩm của cửa hàng
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} sản phẩm
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground mb-4">
                  Không có sản phẩm nào khớp với từ khóa "{searchQuery}"
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Xóa bộ lọc
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={app.addToCart}
                  onViewDetail={app.handleViewProductDetail}
                  onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
                  isLoggedIn={app.isLoggedIn}
                  onLogin={app.handleLogin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flying Icon Animation */}
      {app.flyingIcons && app.flyingIcons.length > 0 && (
        <FlyingIcon
          icons={app.flyingIcons}
          onComplete={app.handleAnimationComplete}
        />
      )}
    </main>
  );
}

