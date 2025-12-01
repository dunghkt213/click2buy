import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
    USER = 'USER',
    SELLER = 'SELLER',
    ADMIN = 'ADMIN',
}

export class RegisterDto {
    @ApiProperty({
        type: String,
        description: 'Tên đăng nhập của người dùng',
        example: 'john_doe',
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        type: String,
        description: 'Email người dùng',
        example: 'john@gmail.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        enum: UserRole,
        description: 'Vai trò của tài khoản (USER, SELLER, ADMIN)',
        example: UserRole.USER,
    })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({
        type: String,
        minLength: 6,
        description: 'Mật khẩu plaintext — backend sẽ tự hash thành passwordHash',
        example: '123456',
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiPropertyOptional({
        type: String,
        description: 'Số điện thoại người dùng',
        example: '0987654321',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'URL avatar đại diện của người dùng',
        example: 'https://cdn.example.com/avatar/john.png',
    })
    @IsOptional()
    @IsString()
    avatar?: string;
}
