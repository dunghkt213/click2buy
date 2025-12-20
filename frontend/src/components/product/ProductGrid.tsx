import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Filter, Grid, List } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FilterState, Product } from 'types';
import { productApi } from '../../apis/product';
import { Button } from '../ui/button';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  filters: FilterState;
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
  onViewDetail?: (product: Product) => void;
  onTriggerFlyingIcon?: (type: 'cart', element: HTMLElement) => void;
  isLoggedIn?: boolean; // THÊM: Kiểm tra đăng nhập
  onLogin?: () => void; // THÊM: Callback để mở modal đăng nhập
}

export function ProductGrid({
  filters,
  onAddToCart,
  searchQuery = '',
  onViewDetail,
  onTriggerFlyingIcon,
  isLoggedIn = false,
  onLogin,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productGridRef = useRef<HTMLDivElement>(null);

  // Motion variants
  const motionEase = [0.4, 0, 0.2, 1] as const;
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: motionEase } },
  };

  // Fetch products từ backend với pagination
  const fetchProducts = async (page: number = 1, categoryId?: string) => {
    setLoading(true);
    try {
      // Build query với categoryId nếu có
      const queryParams: any = {
        page, 
        limit: 40 
      };
      
      // Thêm categoryId nếu category được chọn và không phải 'all'
      const selectedCategoryId = categoryId || (filters.category && filters.category !== 'all' ? filters.category : undefined);
      if (selectedCategoryId) {
        queryParams.categoryId = selectedCategoryId;
      }
      
      console.log('📦 [ProductGrid] Fetching products with query:', queryParams);
      
      const result = await productApi.getAll(queryParams);
      
      console.log('📦 [ProductGrid] API Response:', result);
      
      setAllProducts(result.products);
      
      if (result.pagination) {
        console.log('📦 [ProductGrid] Pagination info:', result.pagination);
        setCurrentPage(result.pagination.page || page);
        setTotalPages(result.pagination.totalPages || 1);
        setTotalProducts(result.pagination.total || result.products.length);
      } else {
        // Fallback: Tính toán từ số lượng sản phẩm
        // Nếu có đúng 40 sản phẩm, có thể còn trang tiếp theo
        const hasMore = result.products.length === 40;
        const estimatedPages = hasMore ? page + 1 : page;
        
        console.log('⚠️ [ProductGrid] No pagination info, using fallback:', {
          productsCount: result.products.length,
          currentPage: page,
          estimatedPages
        });
        
        setCurrentPage(page);
        setTotalPages(estimatedPages);
        setTotalProducts(result.products.length * estimatedPages);
      }
      
      // Scroll đến phần hiển thị sản phẩm khi đổi trang
      if (productGridRef.current) {
        const headerOffset = 80; // Offset cho fixed header
        const elementPosition = productGridRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.error('❌ [ProductGrid] Error:', err);
      toast.error('Không thể tải sản phẩm từ server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products khi component mount
  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch khi category thay đổi
  useEffect(() => {
    // Reset về trang 1 khi category thay đổi
    setCurrentPage(1);
    const categoryId = filters.category && filters.category !== 'all' ? filters.category : undefined;
    fetchProducts(1, categoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('🔄 [ProductGrid] Page change requested:', {
      requestedPage: page,
      currentPage,
      totalPages,
      isValid: page >= 1 && page <= totalPages && page !== currentPage
    });
    
    if (page >= 1 && page !== currentPage) {
      // Cho phép chuyển trang ngay cả khi totalPages chưa chính xác
      fetchProducts(page);
    }
  };


  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(q) &&
        !product.description.toLowerCase().includes(q) &&
        !product.brand.toLowerCase().includes(q)
      ) return false;
    }
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (product.rating < filters.rating) return false;
    if (filters.inStock && !product.inStock) return false;
    return true;
  });

  return (
    <div ref={productGridRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sản phẩm</h2>
          <p className="text-muted-foreground">
            {loading
              ? 'Đang tải sản phẩm...'
              : `Hiển thị ${filteredProducts.length} sản phẩm`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <p className="text-center py-16 text-muted-foreground">Đang tải sản phẩm...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-muted-foreground">Thử điều chỉnh bộ lọc để xem thêm sản phẩm</p>
        </div>
      ) : (
        <motion.div
          layout
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants} layout>
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                viewMode={viewMode}
                onViewDetail={onViewDetail}
                onTriggerFlyingIcon={onTriggerFlyingIcon}
                isLoggedIn={isLoggedIn}
                onLogin={onLogin}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination - Luôn hiển thị để dễ test */}
      {!loading && (
        <div className="flex flex-col items-center gap-4 mt-12 pt-8 border-t">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                console.log('👆 [ProductGrid] Previous clicked, currentPage:', currentPage);
                handlePageChange(currentPage - 1);
              }}
              disabled={currentPage <= 1}
              className="gap-1 min-w-[100px]"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 7;
                
                if (totalPages <= maxVisible) {
                  // Hiển thị tất cả nếu <= 7 trang
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Luôn hiển thị trang đầu
                  pages.push(1);
                  
                  if (currentPage <= 4) {
                    // Ở đầu: 1, 2, 3, 4, 5, ..., totalPages
                    for (let i = 2; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    // Ở cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Ở giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground font-medium">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="default"
                      onClick={() => {
                        console.log('👆 [ProductGrid] Page number clicked:', page);
                        handlePageChange(page as number);
                      }}
                      className={`min-w-[44px] h-10 font-medium ${
                        currentPage === page 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                console.log('👆 [ProductGrid] Next clicked, currentPage:', currentPage, 'totalPages:', totalPages);
                handlePageChange(currentPage + 1);
              }}
              disabled={false} // Không disable để có thể test, sẽ disable nếu thực sự không còn trang
              className="gap-1 min-w-[100px]"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
