import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './app.service';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { CurrentUser } from './auth/current-user.decorator';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** Lấy tất cả carts theo seller */
  @MessagePattern('cart.getAll')
  @UseGuards(JwtKafkaAuthGuard)
  getCarts(@Payload() data: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.cartService.getCarts(userId);
  }

  /** Thêm sản phẩm */
  @MessagePattern('cart.add')
  @UseGuards(JwtKafkaAuthGuard)
  addItem(@Payload() data: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.cartService.addItem(userId, data);
  }

  /** Cập nhật 1 item */
  @MessagePattern('cart.update')
  @UseGuards(JwtKafkaAuthGuard)
  updateItem(@Payload() data: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    const { sellerId, productId, dto } = data;

    return this.cartService.updateItem(
      userId,
      sellerId,
      productId,
      dto.quantity,
      dto.price,
    );
  }

  /** Xóa item */
  @MessagePattern('cart.remove')
  @UseGuards(JwtKafkaAuthGuard)
  removeItem(@Payload() data: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    const { sellerId, productId } = data;

    return this.cartService.removeItem(
      userId,
      sellerId,
      productId,
    );
  }
}
