import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OrderItemDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

class ShippingAddressDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsString()
  zip: string;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsEnum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsEnum(['unpaid', 'paid', 'refunded'])
  @IsOptional()
  paymentStatus?: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: Date;

  @ValidateNested()
  shippingAddress: ShippingAddressDto;

  @IsEnum(['GHN', 'GHTK', 'VNPost', 'Other'])
  @IsOptional()
  shippingMethod?: string;
}
