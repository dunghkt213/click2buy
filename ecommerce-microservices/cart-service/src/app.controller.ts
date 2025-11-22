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
    return this.cartService.getCarts(user.id);
  }

  /** Thêm sản phẩm */
  @MessagePattern('cart.add')
  @UseGuards(JwtKafkaAuthGuard)
  addItem(@Payload() data: any,@CurrentUser() user: any) {
    const { dto } = data;
    return this.cartService.addItem(user.id, dto);
  }

  /** Cập nhật 1 item */
  @MessagePattern('cart.update')
  @UseGuards(JwtKafkaAuthGuard)
  updateItem(@Payload() data: any, @CurrentUser() user: any) {
    const { sellerId, productId, dto } = data;
    return this.cartService.updateItem(
      user.id,
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
    const { sellerId, productId } = data;
    return this.cartService.removeItem(
      user.id,
      sellerId,
      productId,
    );
  }
}
