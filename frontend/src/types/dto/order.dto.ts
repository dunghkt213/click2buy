/**
 * Order DTOs - Data Transfer Objects for Orders
 */

// ============================================
// Request DTOs
// ============================================

export interface CreateOrderDto {
  orderCode: string;
  paymentMethod: string;

  // ❗ đổi items → carts để đúng payload FE gửi
  carts: {
    sellerId: string;
    products: { productId: string; quantity: number }[];
  }[];

  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };

  shippingMethod: string;
  note?: string;
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
  orderNumber?: string;
  userId?: string;
  items?: BackendOrderItemDto[];
  totalPrice?: number;
  shippingFee?: number;
  discount?: number;
  finalPrice?: number;
  status?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  shippingAddress?: ShippingAddressDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendOrderItemDto {
  productId: string;
  product?: any;
  quantity: number;
  price: number;
}

