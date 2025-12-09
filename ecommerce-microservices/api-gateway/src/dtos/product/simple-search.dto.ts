import { ApiProperty } from '@nestjs/swagger';

export class SimpleSearchDto {
    @ApiProperty({
        example: 'iphone',
        description: 'Từ khóa tìm kiếm sản phẩm'
    })
    keyword: string;
}
