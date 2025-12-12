import {
  Controller,
  Get,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from '../analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RevenueDataItem } from '../dto/revenue-response.dto';
import { TopProductItem } from '../dto/top-product-response.dto';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('revenue')
  @ApiOperation({
    summary: 'Lấy thống kê doanh thu',
    description: 'Trả về dữ liệu doanh thu theo ngày trong khoảng thời gian (tuần/tháng). Chỉ seller mới có quyền truy cập.',
  })
  @ApiQuery({
    name: 'type',
    enum: ['WEEK', 'MONTH'],
    required: false,
    description: 'Khoảng thời gian thống kê (mặc định: WEEK)',
    example: 'WEEK',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách doanh thu theo ngày',
    type: [RevenueDataItem],
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có quyền truy cập' })
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
  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm bán chạy',
    description: 'Trả về top N sản phẩm bán chạy nhất của seller, sắp xếp theo số lượng đã bán.',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Số lượng sản phẩm trả về (mặc định: 5)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách sản phẩm bán chạy',
    type: [TopProductItem],
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Chỉ seller mới có quyền truy cập' })
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