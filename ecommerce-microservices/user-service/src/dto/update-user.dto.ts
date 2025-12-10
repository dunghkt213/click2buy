import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Mật khẩu mới (nếu muốn đổi pass thì nhập, không thì thôi)
  @IsOptional() 
  @IsString() 
  @MinLength(6)
  password?: string;

  // Thêm trường này: Mật khẩu hiện tại dùng để xác thực quyền cập nhật
  @IsOptional()
  @IsString()
  currentPassword?: string;
}