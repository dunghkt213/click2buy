import {
  IsBooleanString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller',
}

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (username, email hoặc phone)',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Lọc theo vai trò người dùng (USER, SELLER, ADMIN)',
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hoạt động',
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: string; // 'true' | 'false' (swagger gửi string)

  @ApiPropertyOptional({
    description: 'Số trang muốn lấy (mặc định 1)',
    example: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Số item mỗi trang (mặc định 10)',
    example: '10',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
  

  @ApiPropertyOptional({
    description:
      'Sort theo field, dấu "-" để sort DESC. Ví dụ: "-createdAt,username"',
    example: '-createdAt,username',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
