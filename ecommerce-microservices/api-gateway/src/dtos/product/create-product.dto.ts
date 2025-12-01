import { ApiProperty } from '@nestjs/swagger';

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
}

export class WarehouseAddress {
  @ApiProperty({ example: '123 Nguyễn Trãi' })
  line1: string;

  @ApiProperty({ required: false, example: 'Tầng 2' })
  line2?: string;

  @ApiProperty({ example: 'Hà Nội' })
  city: string;

  @ApiProperty({ required: false, example: 'Thanh Xuân' })
  province?: string;

  @ApiProperty({ required: false, example: 'Việt Nam' })
  country?: string;

  @ApiProperty({ required: false, example: '100000' })
  postalCode?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max' })
  name: string;

  @ApiProperty({ required: false, example: 'Điện thoại cao cấp 2025' })
  description?: string;

  @ApiProperty({ example: 29990000 })
  price: number;

  @ApiProperty({ required: false, example: 27990000 })
  salePrice?: number;

  @ApiProperty({ required: false, example: 10 })
  stock?: number;

  @ApiProperty({ example: 'Apple' })
  brand: string;

  @ApiProperty({
    required: false,
    enum: ProductCondition,
    example: ProductCondition.NEW,
  })
  condition?: ProductCondition;

  @ApiProperty({ required: false, type: [String], example: ['cat123', 'cat456'] })
  categoryIds?: string[];

  @ApiProperty({ required: false, type: [String], example: ['smartphone', 'apple'] })
  tags?: string[];

  @ApiProperty({ required: false, type: [String], example: ['https://img.com/a.jpg'] })
  images?: string[];

  @ApiProperty({ required: false, example: { color: 'black', storage: '256GB' } })
  attributes?: Record<string, any>;

  @ApiProperty({ required: false, example: { variantKey: 'value' } })
  variants?: Record<string, any>;

  @ApiProperty({ required: false, type: WarehouseAddress })
  warehouseAddress?: WarehouseAddress;
}
