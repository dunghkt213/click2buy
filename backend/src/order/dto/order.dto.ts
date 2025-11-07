import { Types } from 'mongoose';

export class OrderDto {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  expectedDeliveryDate?: Date;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    ward: string;
    district: string;
    province: string;
  };
  shippingMethod: string;
  createdAt: Date;
  updatedAt: Date;
}
