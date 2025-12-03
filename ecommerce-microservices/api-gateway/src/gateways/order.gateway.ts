import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers, BadRequestException, Patch } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';

@Controller('orders')
export class OrderGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('order.create');
    this.kafka.subscribeToResponseOf('order.getAllOrderForSaller');
    this.kafka.subscribeToResponseOf('order.getAllOrderForUser');
    await this.kafka.connect();
  }

  @Post()
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    
    try {
      return this.kafka.send('order.create', {...dto, auth });
    } catch(err){
      return  new BadRequestException(err.message || 'Service error');
    }
  }
  @Patch('seller/orders/:orderId/approve')
  async approveOrderForSeller(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      const payload = { orderId, auth };

      return await this.kafka
        .send('order.seller.approve', payload)
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Approve failed');
    }
  }

  @Patch('seller/orders/:orderId/reject')
  async rejectOrderForSeller(
    @Param('orderId') orderId: string,
    @Headers('authorization') auth: string,
  ) {
    try {
      const payload = { 
        orderId, 
        auth 
      };

      return await this.kafka
        .send('order.seller.reject', payload)
        .toPromise();
    } catch (err) {
      throw new BadRequestException(err.message || 'Reject failed');
    }
  }


  @Get('seller')
  getOrder(@Headers('authorization') auth?: string) {
    
    try {
      return this.kafka.send('order.getAllOrderForSaller', {auth});
    } catch(err){
      return  new BadRequestException(err.message || 'Service error');
    }
  }
 @Get('user')
  getOrderForUser(@Headers('authorization') auth?: string) {
    
    try {
      return this.kafka.send('order.getAllOrderForUser', {auth});
    } catch(err){
      return  new BadRequestException(err.message || 'Service error');
    }
  }

}
