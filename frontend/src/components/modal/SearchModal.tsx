import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { ProductCard } from '../product/ProductCard';
import { Product } from 'types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  initialSearchQuery?: string; // Query tìm kiếm từ Header
}

const categories = [
  { id: 'all', name: 'Tất cả', icon: '🔍' },
  { id: 'fashion', name: 'Thời trang', icon: '👕' },
  { id: 'electronics', name: 'Điện tử', icon: '📱' },
  { id: 'home', name: 'Nhà cửa', icon: '🏠' },
  { id: 'books', name: 'Sách', icon: '📚' },
  { id: 'sports', name: 'Thể thao', icon: '⚽' },
  { id: 'beauty', name: 'Làm đẹp', icon: '💄' },
  { id: 'baby', name: 'Mẹ & Bé', icon: '👶' },
];

export function SearchModal({ isOpen, onClose, onAddToCart, initialSearchQuery = '' }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Cập nhật search query khi modal mở với query từ Header
  useEffect(() => {
    if (isOpen && initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [isOpen, initialSearchQuery]);

  // Mock products data
  const allProducts: Product[] = [
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
      name: 'Sách Dạy Nấu Ăn Cơ Bản',
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

  // Filter products - luôn filter theo search query
  const filteredProducts = allProducts.filter(product => {
    // Bắt buộc phải có search query
    if (!searchQuery.trim()) return false;
    
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base bg-muted/50 border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="shrink-0 rounded-full"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content - Chỉ hiển thị kết quả tìm kiếm */}
        <ScrollArea className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Kết quả tìm kiếm "{searchQuery}"
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {searchQuery.trim() ? `Tìm thấy ${filteredProducts.length} sản phẩm` : 'Nhập từ khóa để tìm kiếm'}
                  </p>
                </div>
              </div>

              {!searchQuery.trim() ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium mb-2">Bắt đầu tìm kiếm</h3>
                  <p className="text-muted-foreground text-sm">
                    Nhập tên sản phẩm, thương hiệu hoặc từ khóa ở ô tìm kiếm phía trên
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-muted-foreground text-sm">
                    Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Thử tìm kiếm với từ khóa khác hoặc chọn danh mục bên trên
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      viewMode="grid"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
