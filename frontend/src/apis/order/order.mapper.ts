/**
 * Order Mapper - Maps backend order responses to frontend types
 */

import { BackendOrderDto } from '../../types/dto/order.dto';
import { Order } from '../../types/interface/order.types';

export function mapOrderResponse(data: BackendOrderDto): Order {
  return {
    id: data._id || data.id || '',
    orderNumber: data.orderNumber || `ORD-${data._id || data.id || ''}`,
    items: (data.items || []).map(item => ({
      id: item.productId,
      productId: item.productId,
      name: item.product?.name || 'Sản phẩm',
      image: item.product?.image || item.product?.images?.[0] || '',
      price: item.price,
      quantity: item.quantity,
    })),
    totalPrice: data.totalPrice || 0,
    shippingFee: data.shippingFee || 0,
    discount: data.discount || 0,
    finalPrice: data.finalPrice || data.totalPrice || 0,
    status: (data.status as Order['status']) || 'pending',
    paymentMethod: data.paymentMethod || 'cod',
    shippingMethod: data.shippingMethod || 'standard',
    shippingAddress: data.shippingAddress || {
      name: '',
      phone: '',
      address: '',
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    timeline: [],
  };
}

