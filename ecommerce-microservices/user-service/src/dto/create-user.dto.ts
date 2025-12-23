import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength }
from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {

  @IsString()
  name : string;
  
  @IsString() @IsNotEmpty()
  username: string;

  @IsEmail() @IsNotEmpty()
  email: string;

  @IsString() @MinLength(6) @IsNotEmpty()
  password: string; // client gửi plain password -> BE sẽ hash thành passwordHash

  @IsString() @IsNotEmpty()
  phone?: string;

  @IsOptional() @IsString()
  avatar?: string;
}
