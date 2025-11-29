import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers, BadRequestException } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';

@Controller('orders')
export class OrderGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('order.create');
    this.kafka.subscribeToResponseOf('order.getAllOrderForSaller');
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

  @Get('seller')
  getCart(@Headers('authorization') auth?: string) {
    
    try {
      return this.kafka.send('order.getAllOrderForSaller', {auth});
    } catch(err){
      return  new BadRequestException(err.message || 'Service error');
    }
  }

}
