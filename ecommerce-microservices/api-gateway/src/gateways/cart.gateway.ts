import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('cart')
export class CartGateway {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    // Các topic RPC API Gateway phải subscribe để nhận response
    this.kafka.subscribeToResponseOf('cart.getAll');
    this.kafka.subscribeToResponseOf('cart.add');
    this.kafka.subscribeToResponseOf('cart.update');
    this.kafka.subscribeToResponseOf('cart.remove');

    await this.kafka.connect();
  }

  /** Lấy tất cả giỏ hàng theo seller */
  @Get()
  getCarts(@Headers('authorization') auth?: string) {
    return this.kafka.send('cart.getAll', { auth });
  }

  /** Thêm sản phẩm vào cart */
  @Post('add')
  addItem(
    @Headers('authorization') auth: string,
    @Body()
    dto: {
      productId: string;
      quantity: number;
      price: number;
      sellerId: string;
    },
  ) {
    return this.kafka.send('cart.add', { auth, dto });
  }

  /** Cập nhật item */
  @Patch(':sellerId/update/:productId')
  updateItem(
    @Headers('authorization') auth: string,
    @Param('sellerId') sellerId: string,
    @Param('productId') productId: string,
    @Body() dto: { quantity: number; price: number },
  ) {
    return this.kafka.send('cart.update', {
      auth,
      sellerId,
      productId,
      dto,
    });
  }

  /** Xóa sản phẩm */
  @Delete(':sellerId/remove/:productId')
  removeItem(
    @Headers('authorization') auth: string,
    @Param('sellerId') sellerId: string,
    @Param('productId') productId: string,
  ) {
    return this.kafka.send('cart.remove', {
      auth,
      sellerId,
      productId,
    });
  }
}
