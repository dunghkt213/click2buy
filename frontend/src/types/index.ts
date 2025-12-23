// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number; // THÊM: Phần trăm giảm giá
  image: string;
  category: string;
  rating: number;
  ratingAvg?: number; // Rating trung bình từ backend
  reviews: number;
  description: string;
  brand: string;
  inStock: boolean;
  stock?: number; // THÊM: Số lượng còn lại trong kho
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean; // THÊM: Sản phẩm bán chạy
  soldCount?: number; // THÊM: Số lượng đã bán
  reservedStock?: number; // Số sản phẩm đã bán (từ reservedStock trong JSON)
  timeLeft?: string; // THÊM: Thời gian còn lại của deal
  images?: string[]; // THÊM: Nhiều ảnh sản phẩm
  specifications?: { [key: string]: string }; // THÊM: Thông số kỹ thuật
  ownerId?: string; // ID của người bán (từ backend)
  sellerId?: string; // Alias cho ownerId để dùng trong cart
  reviewSummary?: string; // AI-generated review summary
}

// THÊM: Review/Comment types
export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
  helpful: number;
  isVerifiedPurchase?: boolean;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean;
  variant?: string; // THÊM: Phân loại hàng
  cartId?: string; // ID của cart trong database
}

// THÊM: Order types
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled' | 'refund' | 'cancel_request';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
  shippingFee: number;
  discount: number;
  voucherDiscount?: number;
  paymentDiscount?: number;
  finalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingMethod: string;
  ownerId?: string; // ID của shop/seller
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  expiresAt?: string;
  trackingNumber?: string;
  note?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
}

// THÊM: Store types
export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sold: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  rating: number;
  reviews: number;
}

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  rating: number;
  totalReviews: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover?: string;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  followers: number;
  joinedDate: string;
  address: string;
  phone: string;
  email: string;
}

// Filter types
export interface FilterState {
  category: string;
  priceRange: [number, number];
  brands: string[];
  rating: number;
  inStock: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'order' | 'shipping' | 'promotion' | 'review' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  role?: 'customer' | 'seller' | 'admin'; // THÊM: Role của user
}

// Promotion types
export interface Promotion {
  id: string;
  type: 'flash-sale' | 'discount' | 'voucher' | 'cashback' | 'gift' | 'event';
  title: string;
  description: string;
  discount: string;
  startDate: string;
  endDate: string;
  image?: string;
  isActive: boolean;
  isHot?: boolean;
  isLimited?: boolean;
  progress?: number;
  claimed?: number;
  total?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  categoryApplied?: string[];
  code?: string;
}

// Support types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPopular?: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

// Checkout types
export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'BANKING' | 'zalopay' | 'momo' | 'shopeepay' | 'credit-card' | 'cod';
  name: string;
  description: string;
  icon: string;
  isRecommended?: boolean;
  discount?: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: number;
  isRecommended?: boolean;
}

export interface ShopCheckoutData {
  sellerId: string;
  sellerName?: string;
  items: CartItem[];
  subtotal: number;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  voucher?: string;
  voucherDiscount: number;
  total: number;
}

export interface CheckoutData {
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  shops: ShopCheckoutData[];
  systemVoucher?: string;
  systemVoucherDiscount: number;
  totalItems: number;
  totalSubtotal: number;
  totalShippingFee: number;
  totalDiscount: number;
  finalTotal: number;
  note?: string;
}