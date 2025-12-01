import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {

    @ApiProperty({
        type: String,
        description: 'Tên đăng nhập của người dùng',
        example: 'john_doe',
    })
    @IsString()
    username: string;

    @ApiProperty({
        type: String,
        description: 'Mật khẩu của người dùng',
        example: '123456',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
