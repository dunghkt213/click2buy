import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';

/**
 * Controller cung cấp API Order Operations cho Seller
 */
@Controller('seller')
export class SellerController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * GET /seller/orders
   * Lấy danh sách đơn hàng (có phân trang, lọc theo trạng thái)
   */
  @Get('orders')
  async getOrders(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 0;
    const sizeNum = size ? parseInt(size, 10) : 10;
    return this.orderService.findAll(pageNum, sizeNum, status);
  }

  /**
   * PUT /seller/orders/:id/confirm
   * Duyệt đơn hàng
   * - Update DB: status = CONFIRMED
   * - Emit Event: order.confirmed với payload { orderId, items: [...] }
   */
  @Put('orders/:id/confirm')
  async confirmOrder(@Param('id') id: string) {
    return this.orderService.confirmOrder(id);
  }

  /**
   * PUT /seller/orders/:id/reject
   * Từ chối đơn hàng
   * - Update DB: status = CANCELLED
   * - Emit Event: order.cancelled
   */
  @Put('orders/:id/reject')
  async rejectOrder(@Param('id') id: string) {
    return this.orderService.rejectOrder(id);
  }
}

