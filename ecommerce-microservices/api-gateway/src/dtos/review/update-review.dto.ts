import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsArray,
  IsMongoId,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Điểm review (1 – 5).',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Nội dung bình luận của người dùng.',
    example: 'Giao hàng nhanh, sản phẩm rất đẹp.',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description:
      'Trạng thái phê duyệt review bởi admin (true = duyệt, false = từ chối).',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean | string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URL hình ảnh người dùng upload cho review.',
    example: [
      'https://cdn.example.com/reviews/img1.jpg',
      'https://cdn.example.com/reviews/img2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  images?: string[];
}
