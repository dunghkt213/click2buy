import { IsString, IsNumber, Min, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating cart item quantity
 * Setting quantity to 0 will remove the item
 */
export class UpdateCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0, { message: 'Quantity must be at least 0' })
  quantity: number;
}
