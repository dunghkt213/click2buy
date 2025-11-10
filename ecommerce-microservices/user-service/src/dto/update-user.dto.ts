import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Khi update, password là tùy chọn.
  @IsOptional() @IsString() @MinLength(6)
  password?: string;
}
