import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  async getRevenue(
    @Query('sellerId') sellerId: string,
    @Query('type') type: 'WEEK' | 'MONTH',
  ) {
    if (!sellerId) {
      throw new BadRequestException('sellerId is required');
    }
    return this.analyticsService.getRevenue(sellerId, type);
  }

  @Get('top-products')
  async getTopProducts(
    @Query('sellerId') sellerId: string,
    @Query('limit') limit: number,
  ) {
    if (!sellerId) {
      throw new BadRequestException('sellerId is required');
    }
    return this.analyticsService.getTopProducts(sellerId, limit || 5);
  }
}