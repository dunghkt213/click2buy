import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from '../analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  async getRevenue(
    @CurrentUser() user: any,
    @Query('type') type: 'WEEK' | 'MONTH',
  ) {
    // Chỉ cho phép seller xem analytics
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can access analytics');
    }

    const sellerId = user.sub || user.id;
    return this.analyticsService.getRevenue(sellerId, type);
  }

  @Get('top-products')
  async getTopProducts(
    @CurrentUser() user: any,
    @Query('limit') limit: number,
  ) {
    // Chỉ cho phép seller xem analytics
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can access analytics');
    }

    const sellerId = user.sub || user.id;
    return this.analyticsService.getTopProducts(sellerId, limit || 5);
  }
}