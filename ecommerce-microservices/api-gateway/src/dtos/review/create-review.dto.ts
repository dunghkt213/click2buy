import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max
} from 'class-validator';

export class CreateReviewDto {

  @ApiProperty({
    type: String,
    description: 'ID của sản phẩm cần đánh giá (Mongo ObjectId)',
    example: '67467bd24993cd524ff1a120',
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({
    type: Number,
    description: 'Điểm rating từ 1 đến 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Bình luận của người dùng (không bắt buộc)',
    example: 'Sản phẩm rất tốt, giao nhanh.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
