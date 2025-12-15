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

    this.kafka.subscribeToResponseOf('product.batch')
    await this.kafka.connect();
  }
  
  /** Lấy tất cả giỏ hàng theo seller */
  @Get()
  async getCarts(@Headers('authorization') auth?: string) {
    const carts = await this.kafka
    .send('cart.getAll', { auth })
    .toPromise();

    if (!carts) return [];
    console.log('Carts:', carts);

    const productIds = carts.flatMap(c => c.items.map(i => i.productId));
    const uniqueIds = [...new Set(productIds)];
    const products = await this.kafka.send('product.batch', { ids: uniqueIds }).toPromise();

    const map = {};
    products.forEach(p => map[p._id] = p);

    // 4. Enrich từng cart item
    const enriched = carts.map(c => ({
      ...c,
      items: c.items.map(item => ({
        ...item,
        product: map[item.productId] || null,  // thêm thông tin product
      }))
    }));

    console.log('Enriched Carts:', enriched);

    return enriched;
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
