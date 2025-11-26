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
    this.kafka.subscribeToResponseOf('cart.productQuantity');
    this.kafka.subscribeToResponseOf('cart.createOrder')
    await this.kafka.connect();
  }
  
  /** Lấy tất cả giỏ hàng theo seller */
  @Get()
  getCarts(@Headers('authorization') auth?: string) {
    return this.kafka.send('cart.getAll', { auth });
  }

  /** Thêm sản phẩm vào cart */
  @Post('')
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
    return this.kafka.send('cart.add', { auth, ...dto });
  }

  /** Cập nhật item */
  @Patch('update')
  updateItem(
    @Headers('authorization') auth: string,
    @Body() dto: { sellerId: string, productId: string, quantity: number; price: number },
  ) {
    return this.kafka.send('cart.update', {
      auth,
      ...dto
    });
  }

  /** Xóa sản phẩm */
  @Delete('product')
  removeItem(
    @Headers('authorization') auth: string,
    @Body() dto: { sellerId: string, productId: string},
  ) {
    return this.kafka.send('cart.remove', {
      auth,
      ...dto
    });
  }
  @Patch('productQuantity')
  updateQuantity(
    @Headers('authorization') auth: string,
    @Body() dto: { sellerId: string, productId: string, quantity: number},
    ) {
    return this.kafka.send('cart.productQuantity', {
      auth,
      ...dto
    });
    }
  @Post('order')
  createOrder(
    @Headers('authorization') auth: string,
    @Body('items') dto :{items: any[], paymentMethod: string}
  ) {
    return this.kafka.send('cart.createOrder', { auth, ...dto });
}
}
