import { IsBooleanString, IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class QueryUserDto {
  @IsOptional() @IsString() search?: string;        // tìm theo username/email/phone
  @IsOptional() @IsEnum(UserRole) role?: UserRole;  // lọc theo role
  @IsOptional() @IsBooleanString() isActive?: string; // 'true' | 'false'

  @IsOptional() @IsNumberString() page?: string;    // số trang (mặc định 1)
  @IsOptional() @IsNumberString() limit?: string;   // số dòng/trang (mặc định 10)
  @IsOptional() @IsString() sort?: string;          // ví dụ: '-createdAt,username'
}
