/**
 * DTO for checkout response
 */
export class CheckoutResponseDto {
  success: boolean;
  message: string;
  orderId?: string;
  itemCount?: number;
}
