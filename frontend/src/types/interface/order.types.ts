/**
 * Order Types - Type definitions for Orders
 */

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
  address?: string; // Địa chỉ nhận hàng (trực tiếp từ order object)
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
  user?: {
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    shopName?: string;
    shopPhone?: string;
    shopEmail?: string;
    shopAddress?: string;
    shopDescription?: string;
  };
}

