import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers,  } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';

@Controller('orders')
export class OrderGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('order.create');
    await this.kafka.connect();
  }

  @Post()
  create(@Body() dto: any, ) {
    return this.kafka.send('order.create', dto );
  }
}
