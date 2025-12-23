/**
 * Order Mapper - Maps backend order responses to frontend types
 */

import { BackendOrderDto } from '../../types/dto/order.dto';
import { Order } from '../../types/interface/order.types';

/**
 * Map backend status to frontend status
 */
function mapStatus(backendStatus: string | undefined): Order['status'] {
  if (!backendStatus) return 'pending';
  
  const statusMap: Record<string, Order['status']> = {
    'PENDING_PAYMENT': 'pending',
    'PENDING_ACCEPT': 'confirmed',
    'CONFIRMED': 'shipping', // CONFIRMED → "Đang giao"
    'SHIPPING': 'shipping', // Giữ lại để tương thích
    'DELIVERED': 'completed', // DELIVERED → "Hoàn thành"
    'CANCELLED': 'cancelled', // CANCELLED → "Đã hủy"
    'REJECTED': 'cancelled', // Giữ lại để tương thích
    'REQUESTED_CANCEL': 'cancel_request', // REQUESTED_CANCEL → "Yêu cầu hủy"
  };
  
  return statusMap[backendStatus] || 'pending';
}

export function mapOrderResponse(data: BackendOrderDto): Order {
  // Calculate totals - prioritize finalTotal/finalPrice, then calculate from components
  const subtotal = data.subtotal || data.total || data.totalPrice || 0;
  const shippingFee = data.shippingFee || 0;
  const voucherDiscount = data.voucherDiscount || 0;
  const paymentDiscount = data.paymentDiscount || 0;
  const totalDiscount = voucherDiscount + paymentDiscount;
  const finalTotal = data.finalTotal || data.finalPrice || (subtotal + shippingFee - totalDiscount);
  
  // Use orderCode if available, otherwise fallback to orderNumber or generate from _id
  const orderNumber = data.orderCode || data.orderNumber || `ORD-${data._id || data.id || ''}`;
  
  return {
    id: data._id || data.id || '',
    orderNumber: orderNumber,
    items: (data.items || []).map(item => ({
      id: item._id || item.productId,
      productId: item.productId,
      name: item.product?.name || 'Sản phẩm',
      image: item.product?.images?.[0] || item.product?.image || '',
      price: item.price,
      quantity: item.quantity,
    })),
    totalPrice: subtotal,
    shippingFee: shippingFee,
    discount: totalDiscount,
    voucherDiscount: voucherDiscount,
    paymentDiscount: paymentDiscount,
    finalPrice: finalTotal,
    status: mapStatus(data.status),
    paymentMethod: data.paymentMethod || 'cod',
    shippingMethod: data.shippingMethod || 'standard',
    shippingAddress: data.shippingAddress || {
      name: '',
      phone: '',
      address: '',
    },
    address: data.address, // Địa chỉ nhận hàng trực tiếp từ order object
    ownerId: data.ownerId,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    estimatedDelivery: data.expiresAt, // Use expiresAt as estimated delivery if available
    expiresAt: data.expiresAt,
    timeline: [],
    user: data.user ? {
      id: data.user._id || data.user.id,
      username: data.user.username,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
      avatar: data.user.avatar,
      role: data.user.role as any,
      shopName: data.user.shopName,
      shopPhone: data.user.shopPhone,
      shopEmail: data.user.shopEmail,
      shopAddress: data.user.shopAddress,
      shopDescription: data.user.shopDescription,
    } : undefined,
  };
}

