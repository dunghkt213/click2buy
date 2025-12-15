/**
 * Common Types - Common type definitions used across the application
 */

export interface Notification {
  id: string;
  type: 'order' | 'shipping' | 'promotion' | 'review' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

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
  items: any[]; // CartItem[]
  subtotal: number; // Tổng tiền sản phẩm của shop này
  shippingMethod: ShippingMethod;
  shippingFee: number; // Phí ship của shop này
  voucher?: string; // Voucher của shop này
  voucherDiscount: number; // Giảm giá từ voucher shop
  total: number; // Tổng tiền sau ship và voucher của shop này
}

export interface CheckoutData {
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  shops: ShopCheckoutData[]; // Array của từng shop
  systemVoucher?: string; // Voucher hệ thống chung
  systemVoucherDiscount: number; // Giảm giá từ voucher hệ thống
  totalItems: number;
  totalSubtotal: number; // Tổng tất cả subtotal của shops
  totalShippingFee: number; // Tổng tất cả shippingFee của shops
  totalDiscount: number; // Tổng tất cả discount (shop vouchers + system voucher + payment discount)
  finalTotal: number;
  note?: string;
}

