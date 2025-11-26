// src/dto/create-payment.dto.ts
import { IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class PaymentItemDto {
  @IsString()
  productId: string;

  @IsString()
  image: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  total: number;
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;
  
  @IsString()
  userId: string;

  @IsString()
  ownerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];

  @IsNumber()
  total: number;

  @IsEnum(['COD', 'VNPAY'])
  paymentMethod: string;
}
