import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Req } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';
@Controller('cart')
export class CartGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('cart.get');
    this.kafka.subscribeToResponseOf('cart.addItem');
    this.kafka.subscribeToResponseOf('cart.updateItem');
    this.kafka.subscribeToResponseOf('cart.removeItem');
    this.kafka.subscribeToResponseOf('cart.clear');
    await this.kafka.connect();
  }

  @Get()
  getCart(@Headers('authorization') auth?: string) {
    return this.kafka.send('cart.get', { auth });
  }

  @Post('items')
  addItem(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('cart.addItem', { dto, auth });
  }

  @Patch('items/:productId')
  updateItem(
    @Param('productId') productId: string,
    @Body() dto: any,
    @Headers('authorization') auth?: string,
  ) {
    return this.kafka.send('cart.updateItem', { productId, dto, auth });
  }

  @Delete('items/:productId')
  removeItem(@Param('productId') productId: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('cart.removeItem', { productId, auth });
  }

  @Delete()
  clear(@Headers('authorization') auth?: string) {
    return this.kafka.send('cart.clear', { auth });
  }
}
