import { ApiProperty } from '@nestjs/swagger';

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
}

export class WarehouseAddress {
  @ApiProperty()
  line1: string;

  @ApiProperty({ required: false })
  line2?: string;

  @ApiProperty()
  city: string;

  @ApiProperty({ required: false })
  province?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  postalCode?: string;
}

export class ProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  salePrice?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  brand: string;

  @ApiProperty({
    enum: ProductCondition,
    description: 'Tình trạng sản phẩm',
  })
  condition: ProductCondition;

  @ApiProperty({
    required: false,
    type: [String],
  })
  categoryIds?: string[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    required: false,
    description: 'Thông tin tuỳ chỉnh (ví dụ: màu sắc, kích thước)',
    type: Object,
  })
  attributes?: Record<string, any>;

  @ApiProperty({
    required: false,
    description: 'Biến thể sản phẩm (ví dụ: S/M/L, màu sắc…) ',
    type: Object,
  })
  variants?: Record<string, any>;

  @ApiProperty({
    required: false,
    default: 0,
  })
  ratingAvg?: number;

  @ApiProperty({
    required: false,
    type: () => WarehouseAddress,
  })
  warehouseAddress?: WarehouseAddress;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
