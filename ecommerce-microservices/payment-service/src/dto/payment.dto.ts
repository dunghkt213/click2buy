export class PaymentDto {
  id: string;
  userId: string;
  ownerId: string;
  paymentMethod: string;
  total: number;
  paidAmount: number;
  status: string;
  items: any[];
  createdAt: Date;
}
