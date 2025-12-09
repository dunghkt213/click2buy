import { ApiProperty } from '@nestjs/swagger';

export class RevenueDataItem {
  @ApiProperty({ example: '2025-12-01', description: 'Ngày (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 1500000, description: 'Tổng doanh thu trong ngày (VND)' })
  totalRevenue: number;

  @ApiProperty({ example: 5, description: 'Tổng số đơn hàng trong ngày' })
  totalOrders: number;
}

export class RevenueSummary {
  @ApiProperty({ example: 15000000, description: 'Tổng doanh thu trong khoảng thời gian' })
  totalRevenue: number;

  @ApiProperty({ example: 45, description: 'Tổng số đơn hàng trong khoảng thời gian' })
  totalOrders: number;

  @ApiProperty({ example: 333333, description: 'Doanh thu trung bình mỗi đơn' })
  averageOrderValue: number;
}

export class RevenueResponse {
  @ApiProperty({ type: RevenueSummary, description: 'Tổng hợp doanh thu' })
  summary: RevenueSummary;

  @ApiProperty({ type: [RevenueDataItem], description: 'Dữ liệu doanh thu theo ngày' })
  chartData: RevenueDataItem[];
}
