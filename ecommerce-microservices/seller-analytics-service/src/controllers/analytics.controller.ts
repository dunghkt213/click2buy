import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

/**
 * Controller cung cấp API Analytics Dashboard
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/revenue
   * Query Params: ?type=WEEK | ?type=MONTH
   * Trả về mảng doanh thu. Nếu ngày nào không có đơn, trả về totalRevenue: 0
   */
  @Get('revenue')
  async getRevenue(@Query('type') type?: string) {
    const revenueType = type === 'MONTH' ? 'MONTH' : 'WEEK';
    return this.analyticsService.getRevenue(revenueType);
  }
}

