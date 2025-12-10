import { ApiProperty } from '@nestjs/swagger';

export class TopProductItem {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID sản phẩm' })
  productId: string;

  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Tên sản phẩm' })
  productName: string;

  @ApiProperty({ example: 150, description: 'Tổng số lượng đã bán' })
  totalSold: number;

  @ApiProperty({ example: 4500000000, description: 'Tổng doanh thu từ sản phẩm (VND)' })
  totalRevenue: number;
}

export class TopProductResponse {
  @ApiProperty({ type: [TopProductItem], description: 'Danh sách sản phẩm bán chạy' })
  products: TopProductItem[];

  @ApiProperty({ example: 5, description: 'Số lượng sản phẩm trả về' })
  total: number;
}
