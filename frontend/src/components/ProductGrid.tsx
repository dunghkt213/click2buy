import React from 'react';
import { ProductCard } from './ProductCard';
import { Product, FilterState } from '../types';
import { Button } from './ui/button';
import { Grid, List, Filter } from 'lucide-react';

interface ProductGridProps {
  filters: FilterState;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ filters, onAddToCart }: ProductGridProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Mock product data
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Áo Sơ Mi Công Sở Nam',
      price: 399000,
      originalPrice: 599000,
      image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBhcHBhcmVsfGVufDF8fHx8MTc1ODA4NDQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
      image: 'https://images.unsplash.com/photo-1754761986430-5d0d44d09d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHNtYXJ0cGhvbmUlMjBsYXB0b3B8ZW58MXx8fHwxNzU4MDY2MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
      image: 'https://images.unsplash.com/photo-1652434819585-80051d62d9a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZnVybml0dXJlJTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3NTgwMzE5MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
      name: 'Sách Dạy Nấu Ăn Cơ Bản',
      price: 149000,
      originalPrice: 199000,
      image: 'https://images.unsplash.com/photo-1595315343110-9b445a960442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMGVkdWNhdGlvbiUyMHN0dWR5fGVufDF8fHx8MTc1ODA0ODQ4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
      image: 'https://images.unsplash.com/photo-1710814824560-943273e8577e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBmaXRuZXNzJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1ODA1MTc5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
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
      image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'beauty',
      rating: 4.8,
      reviews: 892,
      description: 'Kem dưỡng ẩm chuyên sâu với vitamin C, phù hợp mọi loại da.',
      brand: 'L\'Oreal',
      inStock: true,
      isSale: true,
    },
    {
      id: '7',
      name: 'Xe Đạp Trẻ Em 16 inch',
      price: 1899000,
      originalPrice: 2199000,
      image: 'https://images.unsplash.com/photo-1710814824560-943273e8577e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBmaXRuZXNzJTIwZXF1aXBtZW50fGVufDF8fHx8MTc1ODA1MTc5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'baby',
      rating: 4.6,
      reviews: 145,
      description: 'Xe đạp trẻ em có bánh phụ, khung sắt chắc chắn, màu sắc tươi sáng.',
      brand: 'Giant',
      inStock: true,
      isSale: true,
    },
    {
      id: '8',
      name: 'Máy Pha Cà Phê Espresso',
      price: 5990000,
      image: 'https://images.unsplash.com/photo-1740803292374-1b167c1558b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwYXBwbGlhbmNlcyUyMGNvb2tpbmd8ZW58MXx8fHwxNzU4MDAxODE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'home',
      rating: 4.5,
      reviews: 78,
      description: 'Máy pha cà phê tự động, áp suất 15 bar, tạo foam sữa chuyên nghiệp.',
      brand: 'Delonghi',
      inStock: true,
    },
    {
      id: '9',
      name: 'Váy Dạ Hội Sang Trọng',
      price: 2890000,
      originalPrice: 3890000,
      image: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBhcHBhcmVsfGVufDF8fHx8MTc1ODA4NDQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'fashion',
      rating: 4.7,
      reviews: 89,
      description: 'Váy dạ hội dài tay áo ren, chất liệu lụa cao cấp, phù hợp dự tiệc.',
      brand: 'Elise',
      inStock: false,
    },
    {
      id: '10',
      name: 'Laptop Gaming ASUS ROG',
      price: 35990000,
      image: 'https://images.unsplash.com/photo-1722159475082-0a2331580de3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3NwYWNlJTIwc2V0dXB8ZW58MXx8fHwxNzU4MDUwMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'electronics',
      rating: 4.9,
      reviews: 156,
      description: 'Laptop gaming RTX 4060, Intel Core i7, RAM 16GB, SSD 512GB.',
      brand: 'ASUS',
      inStock: true,
      isNew: true,
    },
    {
      id: '11',
      name: 'Bộ Nồi Inox 304 Cao Cấp',
      price: 1599000,
      originalPrice: 2199000,
      image: 'https://images.unsplash.com/photo-1740803292374-1b167c1558b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwYXBwbGlhbmNlcyUyMGNvb2tpbmd8ZW58MXx8fHwxNzU4MDAxODE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'home',
      rating: 4.6,
      reviews: 267,
      description: 'Bộ 5 nồi inox 304, đáy từ 3 lớp, phù hợp mọi loại bếp.',
      brand: 'Sunhouse',
      inStock: true,
      isSale: true,
    },
    {
      id: '12',
      name: 'Serum Vitamin C Chống Lão Hóa',
      price: 890000,
      originalPrice: 1290000,
      image: 'https://images.unsplash.com/photo-1688955665338-fb430ff8436d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBza2luY2FyZXxlbnwxfHx8fDE3NTgwODQyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'beauty',
      rating: 4.8,
      reviews: 423,
      description: 'Serum vitamin C 20%, giúp làm sáng da và chống lão hóa hiệu quả.',
      brand: 'The Ordinary',
      inStock: true,
      isSale: true,
    },
  ];

  // Filter products based on filters
  const filteredProducts = allProducts.filter(product => {
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
            Hiển thị {filteredProducts.length} trong số {allProducts.length} sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-muted-foreground">
            Thử điều chỉnh bộ lọc để xem thêm sản phẩm
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}