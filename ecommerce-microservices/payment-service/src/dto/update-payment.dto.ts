// src/dto/update-payment.dto.ts
import { IsNumber, IsEnum, IsOptional } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'CANCELLED', 'REFUND', 'EXPIRED'])
  status?: string;
}
