import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength }
from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString() @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(6)
  password: string; // client gửi plain password -> BE sẽ hash thành passwordHash

  @IsOptional() @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  avatar?: string;
}
