import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SELLER = 'seller',
}

export class AddressDto {
  @ApiProperty({
    description: 'Địa chỉ dòng 1 (bắt buộc)',
    example: '123 Nguyễn Trãi',
  })
  line1: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ dòng 2 (tuỳ chọn)',
    example: 'Khu đô thị Royal City',
  })
  line2?: string;

  @ApiProperty({
    description: 'Phường/Xã hoặc Quận/Huyện',
    example: 'Thanh Xuân Trung',
  })
  wardOrDistrict: string;

  @ApiProperty({
    description: 'Thành phố',
    example: 'Hà Nội',
  })
  city: string;

  @ApiPropertyOptional({
    description: 'Tỉnh (nếu có)',
    example: 'Hà Nội',
  })
  province?: string;

  @ApiPropertyOptional({
    description: 'Quốc gia',
    example: 'Vietnam',
  })
  country?: string;

  @ApiPropertyOptional({
    description: 'Mã bưu chính',
    example: '100000',
  })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Đây có phải là địa chỉ mặc định hay không',
    example: true,
  })
  isDefault?: boolean;
}

export class UserDto {
  @ApiProperty({
    description: 'ID người dùng',
    example: '67467bd24993cd524ff1a120',
  })
  id: string;

  @ApiProperty({
    description: 'Tên đăng nhập',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Email người dùng',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Vai trò trong hệ thống',
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Số điện thoại',
    example: '0987654321',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Ảnh đại diện',
    example: 'https://cdn.example.com/avatar/john.png',
  })
  avatar?: string;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Lần cuối đăng nhập',
    example: '2024-12-01T10:20:00.000Z',
  })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Ngày tạo tài khoản',
    example: '2024-11-20T15:15:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-11-25T19:40:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [AddressDto],
    description: 'Danh sách địa chỉ của người dùng',
  })
  address: AddressDto[];
}
