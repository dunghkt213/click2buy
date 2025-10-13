import { CartItem, FAQItem, Notification, Promotion, SupportTicket, User } from '../types';

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
    quantity: 2
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
    quantity: 1
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
    quantity: 1
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
    quantity: 1
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
    quantity: 1
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
    quantity: 1
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
    message: 'Bạn có thể đánh giá sản phẩm iPhone 15 Pro Max đã mua để giúp khách hàng khác.',
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
    answer: 'Click2buy hỗ trợ đổi trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên tem, chưa qua sử dụng.',
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
  points: 2580
};