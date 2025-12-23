/**
 * Order DTOs - Data Transfer Objects for Orders
 */

// ============================================
// Request DTOs
// ============================================

export interface CreateOrderDto {
  orderCode: string;
  paymentMethod: string;
  address: string;

  carts: Array<{
    sellerId: string;

    products: Array<{
      productId: string;
      quantity: number;
    }>;

    // ===== OPTIONAL – SHOP LEVEL =====
    voucherCode?: string;       // voucher của shop
    shippingFee?: number;       // phí ship của shop
    paymentDiscount?: number;   // giảm theo payment của shop
  }>;
}


export interface ShippingAddressDto {
  name: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}

export interface OrderQueryDto {
  status?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Response DTOs
// ============================================

// ============================================
// Backend DTOs
// ============================================

export interface BackendOrderDto {
  _id?: string;
  id?: string;
  orderCode?: string;
  orderNumber?: string;
  userId?: string;
  ownerId?: string;
  items?: BackendOrderItemDto[];
  total?: number;
  totalPrice?: number;
  subtotal?: number;
  shippingFee?: number;
  voucherDiscount?: number;
  paymentDiscount?: number;
  discount?: number;
  finalTotal?: number;
  finalPrice?: number;
  status?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAddress?: ShippingAddressDto;
  address?: string; // Địa chỉ nhận hàng (trực tiếp từ order object)
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    _id?: string;
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

export interface BackendOrderItemDto {
  _id?: string;
  productId: string;
  product?: any;
  quantity: number;
  price: number;
}

