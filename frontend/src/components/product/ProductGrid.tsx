import React from 'react';
import { ProductCard } from './ProductCard'
import { Product, FilterState } from '../../types';
import { Button } from '../ui/button';
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
    {
    id: '13',
    name: 'Balo Laptop Chống Nước',
    price: 690000,
    originalPrice: 890000,
    image: 'https://images.unsplash.com/photo-1617112021193-7936e2c9d1cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'fashion',
    rating: 4.6,
    reviews: 412,
    description: 'Balo chống nước, ngăn chứa laptop 15 inch, phù hợp đi học và đi làm.',
    brand: 'SimpleCarry',
    inStock: true,
    isSale: true,
  },
  {
    id: '14',
    name: 'Tai Nghe Bluetooth Chống Ồn',
    price: 1590000,
    originalPrice: 1990000,
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'electronics',
    rating: 4.8,
    reviews: 854,
    description: 'Tai nghe không dây với công nghệ chống ồn chủ động, pin 40 giờ.',
    brand: 'Sony',
    inStock: true,
    isNew: true,
    isSale: true,
  },
  {
    id: '15',
    name: 'Nồi Cơm Điện Cao Tần',
    price: 3290000,
    originalPrice: 3790000,
    image: 'https://images.unsplash.com/photo-1571401671991-f9806f7c7f4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'home',
    rating: 4.7,
    reviews: 302,
    description: 'Nồi cơm điện cao tần 1.8L, nhiều chế độ nấu tự động, tiết kiệm điện.',
    brand: 'Panasonic',
    inStock: true,
    isSale: true,
  },
  {
    id: '16',
    name: 'Sách Lập Trình Python Nâng Cao',
    price: 249000,
    originalPrice: 299000,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'books',
    rating: 4.9,
    reviews: 678,
    description: 'Sách nâng cao kỹ năng Python, bao gồm thực hành OOP và Data Science.',
    brand: 'NXB Khoa Học',
    inStock: true,
    isNew: true,
    isSale: true,
  },
  {
    id: '17',
    name: 'Thảm Yoga Chống Trượt',
    price: 299000,
    originalPrice: 399000,
    image: 'https://images.unsplash.com/photo-1608571423907-3dfad8e2b6a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'sports',
    rating: 4.5,
    reviews: 431,
    description: 'Thảm yoga PU cao cấp, độ bám cao, chống trượt, dễ cuộn gọn.',
    brand: 'Reebok',
    inStock: true,
    isSale: true,
  },
  {
    id: '18',
    name: 'Bộ Dưỡng Tóc Argan Oil',
    price: 590000,
    originalPrice: 790000,
    image: 'https://images.unsplash.com/photo-1589987686283-94c640b2db07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'beauty',
    rating: 4.7,
    reviews: 554,
    description: 'Dầu gội và dầu xả Argan Oil phục hồi tóc hư tổn, dưỡng mềm mượt.',
    brand: 'Moroccanoil',
    inStock: true,
    isSale: true,
  },
  {
    id: '19',
    name: 'Đồng Hồ Nam Dây Da',
    price: 1990000,
    originalPrice: 2590000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'fashion',
    rating: 4.6,
    reviews: 321,
    description: 'Đồng hồ quartz dây da cao cấp, mặt chống trầy, chống nước nhẹ.',
    brand: 'Casio',
    inStock: true,
    isSale: true,
  },
  {
    id: '20',
    name: 'Máy Ảnh Mirrorless',
    price: 21990000,
    originalPrice: 24990000,
    image: 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'electronics',
    rating: 4.9,
    reviews: 278,
    description: 'Máy ảnh mirrorless 24MP, quay 4K, cảm biến APS-C, WiFi kết nối nhanh.',
    brand: 'Canon',
    inStock: true,
    isNew: true,
  },
  {
    id: '21',
    name: 'Ghế Gaming Ergonomic',
    price: 3590000,
    originalPrice: 4590000,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'home',
    rating: 4.8,
    reviews: 510,
    description: 'Ghế gaming ngả 180°, kê đầu và tay êm ái, khung kim loại chắc chắn.',
    brand: 'DXRacer',
    inStock: true,
    isSale: true,
  },
  {
    id: '22',
    name: 'Áo Khoác Hoodie Nam',
    price: 499000,
    originalPrice: 699000,
    image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0642?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'fashion',
    rating: 4.5,
    reviews: 620,
    description: 'Áo hoodie cotton nỉ dày, dáng oversize trẻ trung, phối mũ tiện lợi.',
    brand: 'Uniqlo',
    inStock: true,
    isSale: true,
  },
  {
    id: '23',
    name: 'Đèn Bàn Học LED Cảm Ứng',
    price: 349000,
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'home',
    rating: 4.7,
    reviews: 180,
    description: 'Đèn LED cảm ứng 3 chế độ sáng, tiết kiệm điện, cổ xoay linh hoạt.',
    brand: 'Philips',
    inStock: true,
    isSale: true,
  },
  {
    id: '24',
    name: 'Giày Chạy Bộ Nam',
    price: 1290000,
    originalPrice: 1790000,
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'sports',
    rating: 4.8,
    reviews: 942,
    description: 'Giày chạy bộ đế cao su đàn hồi, thoáng khí, phù hợp mọi địa hình.',
    brand: 'Nike',
    inStock: true,
    isNew: true,
  },
  {
    id: '25',
    name: 'Bộ Sưu Tập Son Môi Matte',
    price: 990000,
    originalPrice: 1290000,
    image: 'https://images.unsplash.com/photo-1589987686283-94c640b2db07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'beauty',
    rating: 4.9,
    reviews: 734,
    description: 'Bộ 3 thỏi son matte lì mịn, giữ màu 8h, không khô môi.',
    brand: 'Maybelline',
    inStock: true,
    isSale: true,
  },
  {
    id: '26',
    name: 'Bộ Cờ Vua Gỗ Cao Cấp',
    price: 890000,
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'toys',
    rating: 4.6,
    reviews: 315,
    description: 'Bộ cờ vua gỗ mun, quân cờ chạm khắc tinh xảo, kèm hộp đựng sang trọng.',
    brand: 'WoodMaster',
    inStock: true,
    isNew: true,
  },
  {
    id: '27',
    name: 'Nồi Chiên Không Dầu 4L',
    price: 1990000,
    originalPrice: 2590000,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e17d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'home',
    rating: 4.8,
    reviews: 1245,
    description: 'Nồi chiên không dầu dung tích 4L, tiết kiệm điện, dễ vệ sinh.',
    brand: 'Lock&Lock',
    inStock: true,
    isSale: true,
  },
  {
    id: '28',
    name: 'Kính Râm Phản Quang Nam Nữ',
    price: 290000,
    originalPrice: 390000,
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'fashion',
    rating: 4.4,
    reviews: 256,
    description: 'Kính râm phân cực, chống tia UV400, thiết kế unisex hiện đại.',
    brand: 'Ray-Ban',
    inStock: true,
    isSale: true,
  },
  {
    id: '29',
    name: 'Bình Giữ Nhiệt Inox 500ml',
    price: 249000,
    image: 'https://images.unsplash.com/photo-1558640475-9e8e5420f7fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'home',
    rating: 4.7,
    reviews: 482,
    description: 'Bình giữ nhiệt inox 304, giữ nóng 8h, giữ lạnh 12h.',
    brand: 'Tiger',
    inStock: true,
  },
  {
    id: '30',
    name: 'Sách “Deep Learning cơ bản”',
    price: 279000,
    originalPrice: 329000,
    image: 'https://images.unsplash.com/photo-1589987686283-94c640b2db07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'books',
    rating: 4.9,
    reviews: 987,
    description: 'Giải thích chi tiết mạng neuron, gradient descent, CNN, RNN.',
    brand: 'NXB Thống Kê',
    inStock: true,
    isNew: true,
  },
  {
    id: '31',
    name: 'Găng Tay Tập Gym',
    price: 190000,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'sports',
    rating: 4.5,
    reviews: 164,
    description: 'Găng tay tập gym chống trượt, bảo vệ cổ tay, chất liệu da bền bỉ.',
    brand: 'Under Armour',
    inStock: true,
  },
  {
    id: '32',
    name: 'Nước Hoa Nam Classic',
    price: 1590000,
    originalPrice: 1990000,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4b9f4d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'beauty',
    rating: 4.8,
    reviews: 600,
    description: 'Hương thơm nam tính, lưu hương 8 tiếng, chai thủy tinh sang trọng.',
    brand: 'Dior',
    inStock: true,
    isSale: true,
  }
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