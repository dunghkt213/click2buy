/**
 * ShopPage - Trang cửa hàng
 * Hiển thị thông tin shop, giới thiệu và các sản phẩm của shop
 */

import { Search, Star, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../apis/product';
import { userApi, BackendUser } from '../../apis/user';
import { FlyingIcon } from '../../components/animation/FlyingIcon';
import { ProductCard } from '../../components/product/ProductCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { useAppContext } from '../../providers/AppProvider';
import { Product } from '../../types';
import { toast } from 'sonner';

export function ShopPage() {
  const app = useAppContext();
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId');
  
  const [shopInfo, setShopInfo] = useState<BackendUser | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load shop info từ API
  useEffect(() => {
    if (ownerId) {
      loadShopInfo(ownerId);
      loadShopProducts(ownerId);
    } else {
      toast.error('Không tìm thấy thông tin cửa hàng');
      setLoadingShop(false);
      setLoadingProducts(false);
    }
  }, [ownerId]);

  const loadShopInfo = async (id: string) => {
    try {
      setLoadingShop(true);
      const shop = await userApi.findOne(id);
      setShopInfo(shop);
    } catch (error: any) {
      console.error('Failed to load shop info:', error);
      toast.error('Không thể tải thông tin cửa hàng');
      setShopInfo(null);
    } finally {
      setLoadingShop(false);
    }
  };

  const loadShopProducts = async (id: string) => {
    try {
      setLoadingProducts(true);
      // Load tất cả products và filter theo ownerId
      const allProducts = await productApi.getAll({ limit: 1000 });
      const filtered = allProducts.filter(p => 
        (p.ownerId === id || p.sellerId === id)
      );
      setShopProducts(filtered);
    } catch (error: any) {
      console.error('Failed to load shop products:', error);
      toast.error('Không thể tải sản phẩm của cửa hàng');
      setShopProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Scroll về đầu trang khi vào trang shop
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Filter products based on search
  const filteredProducts = shopProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loadingShop) {
    return (
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải thông tin cửa hàng...</p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  // Error state - no shop info
  if (!shopInfo) {
    return (
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12">
            <div className="text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy cửa hàng</h3>
              <p className="text-muted-foreground">
                Không thể tải thông tin cửa hàng. Vui lòng thử lại sau.
              </p>
            </div>
          </Card>
        </div>
      </main>
    );
  }

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
                  src={shopInfo.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shopInfo.shopName || shopInfo.username || 'Shop') + '&background=0ea5e9&color=fff&size=128'}
                  alt={shopInfo.shopName || shopInfo.username || 'Shop'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(shopInfo.shopName || shopInfo.username || 'Shop') + '&background=0ea5e9&color=fff&size=128';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-center md:text-left">
                {shopInfo.shopName || shopInfo.username || 'Cửa hàng'}
              </h1>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {shopProducts.length} sản phẩm
                </span>
              </div>
              {shopInfo.role === 'seller' && (
                <Badge variant="secondary" className="w-fit">
                  Đã xác thực
                </Badge>
              )}
            </div>

            {/* Right: Shop Introduction */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">Giới thiệu cửa hàng</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {shopInfo.shopDescription || 'Chưa có mô tả cửa hàng.'}
                </p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {shopInfo.shopAddress && (
                  <div>
                    <span className="text-muted-foreground">Địa chỉ:</span>
                    <p className="font-medium mt-1">{shopInfo.shopAddress}</p>
                  </div>
                )}
                {(shopInfo.shopPhone || shopInfo.phone) && (
                  <div>
                    <span className="text-muted-foreground">Liên hệ:</span>
                    <p className="font-medium mt-1">{shopInfo.shopPhone || shopInfo.phone}</p>
                  </div>
                )}
                {(shopInfo.shopEmail || shopInfo.email) && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium mt-1">{shopInfo.shopEmail || shopInfo.email}</p>
                  </div>
                )}
                {shopInfo.createdAt && (
                  <div>
                    <span className="text-muted-foreground">Tham gia:</span>
                    <p className="font-medium mt-1">
                      {new Date(shopInfo.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
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

          {loadingProducts ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Đang tải sản phẩm...</p>
              </div>
            </Card>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? `Không có sản phẩm nào khớp với từ khóa "${searchQuery}"`
                    : 'Cửa hàng này chưa có sản phẩm nào.'}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Xóa bộ lọc
                  </Button>
                )}
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

