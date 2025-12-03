import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CartItem, FilterState, Product } from 'types';
import { productApi } from '../../apis/product';
import { FlyingIcon, FlyingIconConfig } from '../animation/FlyingIcon';
import { Footer } from '../layout/Footer';
import { Header } from '../layout/Header';
import { ProductCard } from '../product/ProductCard';
import { FilterSidebar } from '../sidebars/FilterSidebar';
import { Button } from '../ui/button';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  initialSearchQuery?: string; // Query tìm kiếm từ Header
  // Header props
  cartItemsCount: number;
  wishlistItemsCount: number;
  unreadNotifications: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onNotificationsClick: () => void;
  onPromotionClick: () => void;
  onSupportClick: () => void;
  isLoggedIn: boolean;
  user?: any;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onViewDetail?: (product: Product) => void; // THÊM: Callback xem chi tiết
  onAddToWishlist?: (product: Product) => void; // THÊM: Callback thêm vào wishlist
  isInWishlist?: (productId: string) => boolean; // THÊM: Hàm check wishlist
  onTriggerFlyingIcon?: (type: 'heart' | 'cart', element: HTMLElement) => void; // THÊM: Handler flying animation
  onStoreClick?: () => void; // THÊM: Callback cho store
  onLogoClick?: () => void; // THÊM: Callback cho logo
  cartItems?: CartItem[]; // THÊM: Cart items cho preview
  totalPrice?: number; // THÊM: Total price cho preview
  cartIconRef?: React.RefObject<HTMLButtonElement>; // THÊM: Ref cho cart icon
  wishlistIconRef?: React.RefObject<HTMLButtonElement>; // THÊM: Ref cho wishlist icon
  flyingIcons?: FlyingIconConfig[]; // THÊM: Flying icons cho animation
  onAnimationComplete?: (id: string) => void; // THÊM: Callback khi animation complete
}

export function SearchModal({ 
  isOpen, 
  onClose, 
  onAddToCart, 
  initialSearchQuery = '',
  cartItemsCount,
  wishlistItemsCount,
  unreadNotifications,
  onCartClick,
  onWishlistClick,
  onNotificationsClick,
  onPromotionClick,
  onSupportClick,
  isLoggedIn,
  user,
  onLogin,
  onRegister,
  onLogout,
  onProfileClick,
  onOrdersClick,
  onViewDetail, // THÊM
  onAddToWishlist, // THÊM
  isInWishlist, // THÊM
  onTriggerFlyingIcon, // THÊM
  onStoreClick, // THÊM
  onLogoClick, // THÊM
  cartItems, // THÊM
  totalPrice, // THÊM
  cartIconRef, // THÊM
  wishlistIconRef, // THÊM
  flyingIcons = [], // THÊM
  onAnimationComplete, // THÊM
}: SearchModalProps) {
  const [inputValue, setInputValue] = useState(''); // Giá trị tạm trong input
  const [searchQuery, setSearchQuery] = useState(''); // Giá trị thực tế để filter
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 50000000],
    brands: [],
    rating: 0,
    inStock: true,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cập nhật cả input value và search query khi modal mở với query từ Header
  useEffect(() => {
    if (isOpen && initialSearchQuery) {
      setInputValue(initialSearchQuery);
      setSearchQuery(initialSearchQuery);
    }
  }, [isOpen, initialSearchQuery]);

  // Load products từ API khi search query thay đổi
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, searchQuery, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await productApi.search({
        keyword: searchQuery || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] < 50000000 ? filters.priceRange[1] : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
      });
      setAllProducts(products);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error('Không thể tải sản phẩm');
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock products data (fallback nếu API fail)
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Áo Sơ Mi Công Sở Nam',
      price: 399000,
      originalPrice: 599000,
      image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBhcHBhcmVsfGVufDF8fHx8MTc1ODA4NDQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'fashion',
      rating: 4.5,
      reviews: 324,
      description: 'Áo sơ mi cao cấp, chất liệu cotton 100%, form dáng chuẩn.',
      brand: 'Aristino',
      inStock: true,
      isNew: true,
      isSale: true,
    },
    {
      id: '2',
      name: 'iPhone 15 Pro Max',
      price: 29990000,
      originalPrice: 32990000,
      image: 'https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3B8ZW58MXx8fHwxNzU4MDY2MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'electronics',
      rating: 4.8,
      reviews: 1250,
      description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ và camera 48MP chuyên nghiệp.',
      brand: 'Apple',
      inStock: true,
      isNew: true,
      isSale: true,
    },
    {
      id: '3',
      name: 'Ghế Sofa Phòng Khách',
      price: 8500000,
      originalPrice: 12000000,
      image: 'https://images.unsplash.com/photo-1652434819585-80051d62d9a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZnVybml0dXJlJTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3NTgwMzE5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'home',
      rating: 4.6,
      reviews: 189,
      description: 'Ghế sofa 3 chỗ ngồi, chất liệu da cao cấp, thiết kế hiện đại.',
      brand: 'IKEA',
      inStock: true,
      isSale: true,
    },
    {
      id: '4',
      name: 'Sách Dạy Nấu n Cơ Bản',
      price: 149000,
      originalPrice: 199000,
      image: 'https://images.unsplash.com/photo-1595315343110-9b445a960442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMGVkdWNhdGlvbiUyMHN0dWR5fGVufDF8fHx8MTc1ODA0ODQ4OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'books',
      rating: 4.7,
      reviews: 567,
      description: 'Hướng dẫn nấu ăn từ cơ bản đến nâng cao, hình ảnh minh họa chi tiết.',
      brand: 'NXB Trẻ',
      inStock: true,
      isSale: true,
    },
    {
      id: '5',
      name: 'Tạ Tay Tập Gym 5kg',
      price: 299000,
      image: 'https://images.unsplash.com/photo-1710814824560-943273e8577e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBmaXRuZXNzJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1ODA1MTc5Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'sports',
      rating: 4.4,
      reviews: 234,
      description: 'Tạ tay thép phủ cao su, grip chống trượt, phù hợp tập luyện tại nhà.',
      brand: 'Adidas',
      inStock: true,
    },
    {
      id: '6',
      name: 'Kem Dưỡng Da Mặt',
      price: 450000,
      originalPrice: 650000,
      image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'beauty',
      rating: 4.8,
      reviews: 892,
      description: 'Kem dưỡng ẩm chuyên sâu với vitamin C, phù hợp mọi loại da.',
      brand: 'L\'Oreal',
      inStock: true,
      isSale: true,
    },
    {
      id: '10',
      name: 'Laptop Gaming ASUS ROG',
      price: 35990000,
      image: 'https://images.unsplash.com/photo-1722159475082-0a2331580de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3NwYWNlJTIwc2V0dXB8ZW58MXx8fHwxNzU4MDUwMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'electronics',
      rating: 4.9,
      reviews: 156,
      description: 'Laptop gaming RTX 4060, Intel Core i7, RAM 16GB, SSD 512GB.',
      brand: 'ASUS',
      inStock: true,
      isNew: true,
    },
    {
      id: '12',
      name: 'Serum Vitamin C Chống Lão Hóa',
      price: 890000,
      originalPrice: 1290000,
      image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'beauty',
      rating: 4.8,
      reviews: 423,
      description: 'Serum vitamin C 20%, giúp làm sáng da và chống lão hóa hiệu quả.',
      brand: 'The Ordinary',
      inStock: true,
      isSale: true,
    },
  ];

  // Filter products based on filters (client-side filter cho các filter còn lại)
  // Note: Search, category, price, rating đã được filter ở API level
  const filteredProducts = allProducts.filter(product => {
    // Brand filter
    const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
    
    // Stock filter
    const matchesStock = !filters.inStock || product.inStock;
    
    return matchesBrand && matchesStock;
  });

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setInputValue(value);
  };

  // Handle search input submit
  const handleSearchInputSubmit = () => {
    setSearchQuery(inputValue);
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={cartItemsCount}
        wishlistItemsCount={wishlistItemsCount}
        unreadNotifications={unreadNotifications}
        onCartClick={onCartClick}
        onWishlistClick={onWishlistClick}
        onNotificationsClick={onNotificationsClick}
        onFilterClick={() => setIsFilterOpen(true)}
        onPromotionClick={onPromotionClick}
        onSupportClick={onSupportClick}
        onStoreClick={onStoreClick || (() => {})}
        onLogoClick={onLogoClick || (() => {})}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        searchQuery={inputValue}
        onSearchChange={handleSearchInputChange}
        onSearchClick={handleSearchInputSubmit}
        cartItems={cartItems}
        totalPrice={totalPrice}
        cartIconRef={cartIconRef}
        wishlistIconRef={wishlistIconRef}
      />
      
      <main className="pt-16">
        {/* Search Header Section */}
        <div className="border-b border-border bg-card/50 backdrop-blur-md py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl">
                  {searchQuery.trim() ? `Kết quả tìm kiếm "${searchQuery}"` : 'Tìm kiếm sản phẩm'}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchQuery.trim() ? `Tìm thấy ${filteredProducts.length} sản phẩm` : 'Nhập từ khóa vào ô tìm kiếm phía trên'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Đóng tìm kiếm
              </Button>
            </div>
          </div>
        </div>

        {/* Products with Filter Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <FilterSidebar 
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <div className="flex-1">
              {!searchQuery.trim() ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="mb-2">Bắt đầu tìm kiếm</h3>
                  <p className="text-muted-foreground text-sm">
                    Nhập tên sản phẩm, thương hiệu hoặc từ khóa ở ô tìm kiếm phía trên
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-muted-foreground text-sm">
                    Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      viewMode="grid"
                      onViewDetail={onViewDetail}
                      onAddToWishlist={onAddToWishlist}
                      isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                      onTriggerFlyingIcon={onTriggerFlyingIcon}
                      isLoggedIn={isLoggedIn}
                      onLogin={onLogin}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Flying Icons Animation */}
      {flyingIcons && flyingIcons.length > 0 && onAnimationComplete && (
        <FlyingIcon
          icons={flyingIcons}
          onComplete={onAnimationComplete}
        />
      )}
    </div>
  );
}