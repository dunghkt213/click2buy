import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryReviewDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean|string;

  @IsOptional()
  @IsString()
  search?: string; // tìm theo nội dung comment

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  sortBy?: 'createdAt' | 'rating';

  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
