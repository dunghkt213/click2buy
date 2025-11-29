import { motion } from 'framer-motion';
import { Filter, Grid, List } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FilterState, Product } from 'types';
import { Button } from '../ui/button';
import { ProductCard } from './ProductCard';
import { productApi, mapProductResponse } from '../../lib/productApi';
import { toast } from 'sonner';

interface ProductGridProps {
  filters: FilterState;
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
  onViewDetail?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  isInWishlist?: (productId: string) => boolean;
  onTriggerFlyingIcon?: (type: 'heart' | 'cart', element: HTMLElement) => void;
}

export function ProductGrid({
  filters,
  onAddToCart,
  searchQuery = '',
  onViewDetail,
  onAddToWishlist,
  isInWishlist,
  onTriggerFlyingIcon,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch products từ backend
  useEffect(() => {
  setLoading(true);
  productApi.getAll()
    .then((res) => {
      const products = res.map(mapProductResponse);
      setAllProducts(products);

      // ✅ Thông báo thành công
      toast.success(`Tải ${products.length} sản phẩm thành công!`);
      console.log('Products loaded:', products); // in ra console để kiểm tra
    })
    .catch((err) => {
      console.error(err);
      toast.error('Không thể tải sản phẩm từ server');
    })
    .finally(() => setLoading(false));
}, []);


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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sản phẩm</h2>
          <p className="text-muted-foreground">
            {loading
              ? 'Đang tải sản phẩm...'
              : `Hiển thị ${filteredProducts.length} trong số ${allProducts.length} sản phẩm`}
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
          className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
        >
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants} layout>
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                viewMode={viewMode}
                onViewDetail={onViewDetail}
                onAddToWishlist={onAddToWishlist}
                isInWishlist={isInWishlist ? isInWishlist(product.id) : false}
                onTriggerFlyingIcon={onTriggerFlyingIcon}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
