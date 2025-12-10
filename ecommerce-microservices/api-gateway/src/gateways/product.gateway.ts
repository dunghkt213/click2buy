import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';
@Controller('products')
export class ProductGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('product.create');
    this.kafka.subscribeToResponseOf('product.findAll');
    this.kafka.subscribeToResponseOf('product.findOne');
    this.kafka.subscribeToResponseOf('product.update');
    this.kafka.subscribeToResponseOf('product.remove');
    this.kafka.subscribeToResponseOf('product.search');
    await this.kafka.connect();
  }

  @Post()
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.create', { dto, auth });
  }

  @Get()
  findAll(@Query() q: any) {
    return this.kafka.send('product.findAll', { q });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kafka.send('product.findOne', { id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.update', { id, dto, auth });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('product.remove', { id, auth });
  }

  @Post('search')
  search(@Body() q: any) {
    return this.kafka.send('product.search', { q });
  }

}
