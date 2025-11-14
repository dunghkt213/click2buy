import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength }
    from 'class-validator';

export class RegisterDto {
    @IsString() @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    role: string;

    @IsString() @MinLength(6)
    password: string; // client gửi plain password -> BE sẽ hash thành passwordHash

    @IsOptional() @IsString()
    phone?: string;

    @IsOptional() @IsString()
    avatar?: string;
}