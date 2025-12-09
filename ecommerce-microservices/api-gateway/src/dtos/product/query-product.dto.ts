import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from './create-product.dto';

export class QueryProductDto {
  @ApiPropertyOptional({ example: 'iphone' })
  text?: string;

  @ApiPropertyOptional({ example: 'Apple' })
  brand?: string;

  @ApiPropertyOptional({ example: 'cat123' })
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProductCondition })
  condition?: ProductCondition;

  @ApiPropertyOptional({ example: 10000000 })
  minPrice?: number;

  @ApiPropertyOptional({ example: 30000000 })
  maxPrice?: number;

  @ApiPropertyOptional({ example: 4 })
  minRating?: number;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ['price', 'ratingAvg', 'createdAt'], example: 'price' })
  sortBy?: 'price' | 'ratingAvg' | 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;
}
