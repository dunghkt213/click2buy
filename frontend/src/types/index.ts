// Product types
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  description: string;
  brand: string;
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
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