import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;
}

class CartDto {
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  // ===== SHOP LEVEL =====
  @IsOptional()
  @IsString()
  voucherCode?: string;      // voucher của shop

  @IsOptional()
  @IsNumber()
  shippingFee?: number;      // phí ship của shop

  @IsOptional()
  @IsNumber()
  paymentDiscount?: number;  // discount theo payment của shop

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartDto)
  carts: CartDto[];
}
