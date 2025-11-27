export class UpdateOrderStatusDto {
  orderId: string;
  status:
    | 'PENDING_PAYMENT'
    | 'PENDING_SHIPMENT'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'PAID'
    | 'DELIVERED';
}
