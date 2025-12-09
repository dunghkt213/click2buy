import { CartItem, Notification, Promotion, FAQItem, SupportTicket, User, Order, StoreProduct, StoreStats, StoreInfo } from '../types'; // THÊM Store types

export const initialCartItems: CartItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    originalPrice: 34990000,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
    category: 'electronics',
    rating: 4.8,
    reviews: 1250,
    description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP',
    brand: 'Apple',
    inStock: true,
    isSale: true,
    quantity: 2,
    selected: true
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 26990000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
    category: 'electronics',
    rating: 4.7,
    reviews: 890,
    description: 'Samsung Galaxy S24 Ultra với S Pen',
    brand: 'Samsung',
    inStock: true,
    quantity: 1,
    selected: false
  },
  {
    id: '3',
    name: 'MacBook Air M3 13 inch',
    price: 28990000,
    originalPrice: 32990000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
    category: 'electronics',
    rating: 4.9,
    reviews: 650,
    description: 'MacBook Air với chip M3, 8GB RAM, 256GB SSD',
    brand: 'Apple',
    inStock: true,
    isSale: true,
    quantity: 1,
    selected: true
  },
  {
    id: '4',
    name: 'iPad Pro 12.9 inch M4',
    price: 25990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
    category: 'electronics',
    rating: 4.8,
    reviews: 420,
    description: 'iPad Pro với chip M4, màn hình Liquid Retina XDR',
    brand: 'Apple',
    inStock: true,
    quantity: 1,
    selected: false
  },
  {
    id: '5',
    name: 'Sony WH-1000XM5',
    price: 7990000,
    originalPrice: 9990000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'electronics',
    rating: 4.6,
    reviews: 2100,
    description: 'Tai nghe không dây chống ồn hàng đầu',
    brand: 'Sony',
    inStock: true,
    isSale: true,
    quantity: 1,
    selected: true
  },
  {
    id: '6',
    name: 'Dell XPS 13 Plus',
    price: 35990000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    category: 'electronics',
    rating: 4.5,
    reviews: 320,
    description: 'Laptop Dell XPS 13 Plus với Intel Core i7',
    brand: 'Dell',
    inStock: true,
    quantity: 1,
    selected: false
  }
];

export const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Đơn hàng đã được xác nhận',
    message: 'Đơn hàng #SH2024001 đã được xác nhận và đang chuẩn bị hàng',
    time: '5 phút trước',
    isRead: false
  },
  {
    id: '2',
    type: 'shipping',
    title: 'Đơn hàng đang được giao',
    message: 'Đơn hàng #SH2024000 đang trên đường giao đến bạn',
    time: '1 giờ trước',
    isRead: false
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Flash Sale 12.12',
    message: 'Giảm giá tới 50% cho tất cả sản phẩm điện tử. Chỉ còn 2 giờ!',
    time: '2 giờ trước',
    isRead: true
  },
  {
    id: '4',
    type: 'order',
    title: 'Đơn hàng đã giao thành công',
    message: 'Đơn hàng #SH2023999 đã được giao thành công. Cảm ơn bạn đã mua sắm!',
    time: '3 giờ trước',
    isRead: true
  },
  {
    id: '5',
    type: 'system',
    title: 'Cập nhật bảo mật',
    message: 'Hệ thống đã được cập nhật bảo mật mới. Vui lòng đăng nhập lại để đảm bảo an toàn.',
    time: '1 ngày trước',
    isRead: false
  },
  {
    id: '6',
    type: 'promotion',
    title: 'Khuyến mãi cuối tuần',
    message: 'Giảm 30% cho tất cả sản phẩm thời trang. Áp dụng từ thứ 7 đến chủ nhật.',
    time: '1 ngày trước',
    isRead: true
  },
  {
    id: '7',
    type: 'review',
    title: 'Đánh giá sản phẩm',
    message: 'Bạn c thể đánh giá sản phẩm iPhone 15 Pro Max đã mua để giúp khách hàng khác.',
    time: '2 ngày trước',
    isRead: false
  },
  {
    id: '8',
    type: 'shipping',
    title: 'Đơn hàng đang vận chuyển',
    message: 'Đơn hàng #SH2023998 đang được vận chuyển và dự kiến giao trong 24h.',
    time: '2 ngày trước',
    isRead: true
  }
];

export const initialPromotions: Promotion[] = [
  {
    id: '1',
    type: 'flash-sale',
    title: 'Flash Sale 12.12',
    description: 'Giảm giá shock tới 70% cho tất cả sản phẩm điện tử',
    discount: 'Giảm 70%',
    startDate: '2024-12-12T00:00:00',
    endDate: '2024-12-13T23:59:59',
    isActive: true,
    isHot: true,
    isLimited: true,
    progress: 75,
    claimed: 750,
    total: 1000,
    code: 'FLASH1212'
  },
  {
    id: '2',
    type: 'voucher',
    title: 'Voucher Thành Viên Vàng',
    description: 'Ưu đãi đặc biệt dành cho thành viên Gold',
    discount: 'Giảm 500K',
    startDate: '2024-12-01T00:00:00',
    endDate: '2024-12-31T23:59:59',
    isActive: true,
    isHot: false,
    minOrderValue: 2000000,
    maxDiscount: 500000,
    code: 'GOLD500'
  },
  {
    id: '3',
    type: 'cashback',
    title: 'Hoàn tiền ZaloPay',
    description: 'Hoàn 15% tối đa 200K khi thanh toán qua ZaloPay',
    discount: 'Hoàn 15%',
    startDate: '2024-12-10T00:00:00',
    endDate: '2024-12-20T23:59:59',
    isActive: true,
    isHot: true,
    minOrderValue: 500000,
    maxDiscount: 200000
  },
  {
    id: '4',
    type: 'discount',
    title: 'Giảm giá Thời trang',
    description: 'Giảm 40% cho tất cả sản phẩm thời trang nam nữ',
    discount: 'Giảm 40%',
    startDate: '2024-12-15T00:00:00',
    endDate: '2024-12-25T23:59:59',
    isActive: true,
    isHot: false,
    code: 'FASHION40'
  },
  {
    id: '5',
    type: 'gift',
    title: 'Quà tặng đặc biệt',
    description: 'Tặng tai nghe Bluetooth khi mua điện thoại từ 10 triệu',
    discount: 'Tặng quà',
    startDate: '2024-12-01T00:00:00',
    endDate: '2024-12-30T23:59:59',
    isActive: true,
    isHot: true,
    minOrderValue: 10000000
  },
  {
    id: '6',
    type: 'event',
    title: 'Lễ hội mua sắm cuối năm',
    description: 'Nhiều ưu đãi hấp dẫn trong sự kiện cuối năm',
    discount: 'Đa dạng ưu đãi',
    startDate: '2024-12-20T00:00:00',
    endDate: '2024-12-31T23:59:59',
    isActive: true,
    isHot: true
  }
];

export const initialFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'Làm thế nào để theo dõi đơn hàng?',
    answer: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng của tôi" hoặc sử dụng mã tracking được gửi qua email/SMS.',
    category: 'Đơn hàng',
    isPopular: true
  },
  {
    id: '2',
    question: 'Chính sách đổi trả như thế nào?',
    answer: 'ShopMart hỗ trợ đổi trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên tem, chưa qua sử dụng.',
    category: 'Đổi trả',
    isPopular: true
  },
  {
    id: '3',
    question: 'Có những phương thức thanh toán nào?',
    answer: 'Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ZaloPay, chuyển khoản ngân hàng và thanh toán khi nhận hàng (COD).',
    category: 'Thanh toán',
    isPopular: true
  },
  {
    id: '4',
    question: 'Phí vận chuyển được tính như thế nào?',
    answer: 'Phí vận chuyển phụ thuộc vào khu vực và trọng lượng. Miễn phí ship cho đơn hàng từ 1 triệu VNĐ.',
    category: 'Vận chuyển',
    isPopular: false
  }
];

export const initialSupportTickets: SupportTicket[] = [
  {
    id: 'TK001',
    subject: 'Sản phẩm giao không đúng màu',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-12-10',
    lastUpdate: '2024-12-11'
  },
  {
    id: 'TK002',
    subject: 'Hoàn tiền chậm trễ',
    status: 'resolved',
    priority: 'medium',
    createdAt: '2024-12-08',
    lastUpdate: '2024-12-09'
  }
];

export const initialUser: User = {
  id: '1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  avatar: '',
  membershipLevel: 'Gold',
  points: 2580,
//   phone: '0123456789'
};

// THÊM: Initial Orders
export const initialOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'SH2024001',
    items: [
      {
        id: 'item-1',
        productId: '1',
        name: 'iPhone 15 Pro Max 256GB',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
        price: 29990000,
        quantity: 1,
        variant: 'Titan Xanh - 256GB'
      },
      {
        id: 'item-2',
        productId: '5',
        name: 'Sony WH-1000XM5',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        price: 7990000,
        quantity: 1,
        variant: 'Đen'
      }
    ],
    totalPrice: 37980000,
    shippingFee: 0,
    discount: 1000000,
    finalPrice: 36980000,
    status: 'shipping',
    paymentMethod: 'ZaloPay',
    shippingMethod: 'Giao hàng nhanh',
    shippingAddress: {
      name: 'Nguyễn Vn A',
      phone: '0901234567',
      address: '123 Nguyen Van A, 144 Xuan Thuy, Phường Xuân Thủy, Quận Cầu Giấy, Hà Nội'
    },
    createdAt: '2024-11-10T10:30:00',
    updatedAt: '2024-11-11T14:20:00',
    estimatedDelivery: '2024-11-15T23:59:59',
    trackingNumber: 'VN123456789',
    note: 'Giao giờ hành chính',
    timeline: [
      {
        status: 'pending',
        timestamp: '2024-11-10T10:30:00',
        description: 'Đơn hàng đã được đặt'
      },
      {
        status: 'confirmed',
        timestamp: '2024-11-10T11:15:00',
        description: 'Đơn hàng đã được xác nhận'
      },
      {
        status: 'shipping',
        timestamp: '2024-11-11T14:20:00',
        description: 'Đơn hàng đang được giao đến bạn'
      }
    ]
  },
  {
    id: 'order-2',
    orderNumber: 'SH2024002',
    items: [
      {
        id: 'item-3',
        productId: '3',
        name: 'MacBook Air M3 13 inch',
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
        price: 28990000,
        quantity: 1,
        variant: 'Xám - 8GB - 256GB'
      }
    ],
    totalPrice: 28990000,
    shippingFee: 0,
    discount: 0,
    finalPrice: 28990000,
    status: 'completed',
    paymentMethod: 'Chuyển khoản ngân hàng',
    shippingMethod: 'Giao hàng tiêu chuẩn',
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyen Van A, 144 Xuan Thuy, Phường Xuân Thủy, Quận Cầu Giấy, Hà Nội'
    },
    createdAt: '2024-11-01T09:00:00',
    updatedAt: '2024-11-05T16:30:00',
    trackingNumber: 'VN987654321',
    timeline: [
      {
        status: 'pending',
        timestamp: '2024-11-01T09:00:00',
        description: 'Đơn hàng đã được đặt'
      },
      {
        status: 'confirmed',
        timestamp: '2024-11-01T10:30:00',
        description: 'Đơn hàng đã được xác nhận'
      },
      {
        status: 'shipping',
        timestamp: '2024-11-02T08:00:00',
        description: 'Đơn hàng đang được giao'
      },
      {
        status: 'completed',
        timestamp: '2024-11-05T16:30:00',
        description: 'Đơn hàng đã được giao thành công'
      }
    ]
  },
  {
    id: 'order-3',
    orderNumber: 'SH2024003',
    items: [
      {
        id: 'item-4',
        productId: '2',
        name: 'Samsung Galaxy S24 Ultra',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
        price: 26990000,
        quantity: 1,
        variant: 'Titan Gray - 512GB'
      }
    ],
    totalPrice: 26990000,
    shippingFee: 30000,
    discount: 500000,
    finalPrice: 26520000,
    status: 'pending',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingMethod: 'Giao hàng nhanh',
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyen Van A, 144 Xuan Thuy, Phường Xuân Thủy, Quận Cầu Giấy, Hà Nội'
    },
    createdAt: '2024-11-12T15:45:00',
    updatedAt: '2024-11-12T15:45:00',
    estimatedDelivery: '2024-11-16T23:59:59',
    timeline: [
      {
        status: 'pending',
        timestamp: '2024-11-12T15:45:00',
        description: 'Đơn hàng đã được đặt, đang chờ xác nhận'
      }
    ]
  },
  {
    id: 'order-4',
    orderNumber: 'SH2024004',
    items: [
      {
        id: 'item-5',
        productId: '4',
        name: 'iPad Pro 12.9 inch M4',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
        price: 25990000,
        quantity: 1
      }
    ],
    totalPrice: 25990000,
    shippingFee: 0,
    discount: 0,
    finalPrice: 25990000,
    status: 'cancelled',
    paymentMethod: 'Thanh toán khi nhận hàng (COD)',
    shippingMethod: 'Giao hàng tiêu chuẩn',
    shippingAddress: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      address: '123 Nguyen Van A, 144 Xuan Thuy, Phường Xuân Thủy, Quận Cầu Giấy, Hà Nội'
    },
    createdAt: '2024-10-25T11:20:00',
    updatedAt: '2024-10-25T13:00:00',
    note: 'Đổi ý không mua nữa',
    timeline: [
      {
        status: 'pending',
        timestamp: '2024-10-25T11:20:00',
        description: 'Đơn hàng đã được đặt'
      },
      {
        status: 'cancelled',
        timestamp: '2024-10-25T13:00:00',
        description: 'Đơn hàng đã bị hủy theo yêu cầu của khách hàng'
      }
    ]
  }
];

// THÊM: Initial Store Products
export const initialStoreProducts: StoreProduct[] = [
  {
    id: 'sp-1',
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    originalPrice: 34990000,
    stock: 50,
    sold: 125,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300',
    category: 'electronics',
    description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP',
    status: 'active',
    createdAt: '2024-01-15T08:00:00',
    rating: 4.8,
    reviews: 1250
  },
  {
    id: 'sp-2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 26990000,
    stock: 30,
    sold: 89,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
    category: 'electronics',
    description: 'Samsung Galaxy S24 Ultra với S Pen',
    status: 'active',
    createdAt: '2024-02-10T10:00:00',
    rating: 4.7,
    reviews: 890
  },
  {
    id: 'sp-3',
    name: 'MacBook Air M3 13 inch',
    price: 28990000,
    originalPrice: 32990000,
    stock: 5,
    sold: 65,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
    category: 'electronics',
    description: 'MacBook Air với chip M3, 8GB RAM, 256GB SSD',
    status: 'active',
    createdAt: '2024-03-05T09:00:00',
    rating: 4.9,
    reviews: 650
  },
  {
    id: 'sp-4',
    name: 'Sony WH-1000XM5',
    price: 7990000,
    originalPrice: 9990000,
    stock: 0,
    sold: 210,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    category: 'electronics',
    description: 'Tai nghe không dây chống ồn hàng đầu',
    status: 'out_of_stock',
    createdAt: '2024-01-20T11:00:00',
    rating: 4.6,
    reviews: 2100
  },
  {
    id: 'sp-5',
    name: 'Dell XPS 13 Plus',
    price: 35990000,
    stock: 15,
    sold: 32,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
    category: 'electronics',
    description: 'Laptop Dell XPS 13 Plus với Intel Core i7',
    status: 'active',
    createdAt: '2024-04-12T14:00:00',
    rating: 4.5,
    reviews: 320
  },
  {
    id: 'sp-6',
    name: 'iPad Pro 12.9 M2',
    price: 25990000,
    originalPrice: 28990000,
    stock: 25,
    sold: 78,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
    category: 'electronics',
    description: 'iPad Pro 12.9 inch với chip M2, màn hình Liquid Retina',
    status: 'active',
    createdAt: '2024-02-20T12:00:00',
    rating: 4.8,
    reviews: 780
  },
  {
    id: 'sp-7',
    name: 'Apple Watch Series 9',
    price: 9990000,
    originalPrice: 11990000,
    stock: 40,
    sold: 156,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300',
    category: 'electronics',
    description: 'Apple Watch Series 9 GPS + Cellular 45mm',
    status: 'active',
    createdAt: '2024-01-25T15:00:00',
    rating: 4.7,
    reviews: 1560
  },
  {
    id: 'sp-8',
    name: 'AirPods Pro Gen 2',
    price: 6490000,
    originalPrice: 7490000,
    stock: 60,
    sold: 245,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=300',
    category: 'electronics',
    description: 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động',
    status: 'active',
    createdAt: '2024-01-10T10:00:00',
    rating: 4.9,
    reviews: 2450
  },
  {
    id: 'sp-9',
    name: 'PlayStation 5 Slim',
    price: 13990000,
    stock: 20,
    sold: 43,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300',
    category: 'electronics',
    description: 'PlayStation 5 Slim phiên bản mới với dung lượng 1TB',
    status: 'active',
    createdAt: '2024-03-15T16:00:00',
    rating: 4.8,
    reviews: 430
  },
  {
    id: 'sp-10',
    name: 'LG OLED TV 55 inch',
    price: 22990000,
    originalPrice: 26990000,
    stock: 8,
    sold: 28,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300',
    category: 'electronics',
    description: 'Smart TV LG OLED 55 inch 4K, hỗ trợ Dolby Vision',
    status: 'active',
    createdAt: '2024-04-01T13:00:00',
    rating: 4.6,
    reviews: 280
  }
];

// THÊM: Initial Store Stats
export const initialStoreStats: StoreStats = {
  totalProducts: 100,
  totalOrders: 521,
  totalRevenue: 1564000000,
  pendingOrders: 12,
  monthlyRevenue: 285000000,
  monthlyOrders: 85,
  rating: 4.7,
  totalReviews: 5210
};

// THÊM: Initial Store Info
export const initialStoreInfo: StoreInfo = {
  id: 'store-1',
  name: 'ShopMart Official Store',
  description: 'Cửa hàng chính thức của ShopMart - Chuyên cung cấp các sản phẩm công nghệ chất lượng cao',
  logo: '',
  cover: '',
  rating: 4.7,
  totalReviews: 5210,
  totalProducts: 100,
  followers: 15420,
  joinedDate: '2020-01-01T00:00:00',
  address: '123 Nguyen Van A, 144 Xuan Thuy, Phường Xuân Thủy, Quận Cầu Giấy, Hà Nội',
  phone: '0901234567',
  email: 'store@shopmart.vn'
};