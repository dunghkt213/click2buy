import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
    @ApiProperty({ example: 5, description: "Số lượng điều chỉnh. >= 0 là nhập thêm, < 0 là giảm" })
    amount: number;
}
