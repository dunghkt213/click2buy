import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

/**
 * DTO for adding items to cart
 */
export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
