import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Gateway controller để route các request /seller/* và /analytics/* về seller-analytics-service
 * Sử dụng HTTP proxy vì seller-analytics-service là HTTP service
 */
@Controller()
export class SellerAnalyticsGateway {
  private readonly analyticsServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    // URL của seller-analytics-service (trong Docker network)
    this.analyticsServiceUrl =
      process.env.SELLER_ANALYTICS_SERVICE_URL ||
      'http://click2buy_seller-analytics-service:3006';
  }

  /**
   * GET /seller/orders
   * Proxy request đến seller-analytics-service
   */
  @Get('seller/orders')
  async getOrders(@Query() query: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.analyticsServiceUrl}/seller/orders`, {
          params: query,
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error fetching orders',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /seller/orders/:id/confirm
   * Proxy request đến seller-analytics-service
   */
  @Put('seller/orders/:id/confirm')
  async confirmOrder(@Param('id') id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.analyticsServiceUrl}/seller/orders/${id}/confirm`,
          {},
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error confirming order',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * PUT /seller/orders/:id/reject
   * Proxy request đến seller-analytics-service
   */
  @Put('seller/orders/:id/reject')
  async rejectOrder(@Param('id') id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `${this.analyticsServiceUrl}/seller/orders/${id}/reject`,
          {},
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error rejecting order',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /analytics/revenue
   * Proxy request đến seller-analytics-service
   */
  @Get('analytics/revenue')
  async getRevenue(@Query('type') type?: string) {
    try {
      const params = type ? { type } : {};
      const response = await firstValueFrom(
        this.httpService.get(`${this.analyticsServiceUrl}/analytics/revenue`, {
          params,
        }),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error fetching revenue',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

