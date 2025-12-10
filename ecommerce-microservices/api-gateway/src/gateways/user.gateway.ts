import { Body, Controller, Delete, Get, Param, Post, Put, Query, Headers,  } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';

@Controller('users')
export class UserGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('user.create');
    this.kafka.subscribeToResponseOf('user.findAll');
    this.kafka.subscribeToResponseOf('user.findOne');
    this.kafka.subscribeToResponseOf('user.update');
    this.kafka.subscribeToResponseOf('user.deactivate');
    this.kafka.subscribeToResponseOf('user.updateRoleSeller');
    this.kafka.subscribeToResponseOf('user.getInforShop');
    
    await this.kafka.connect();
  }

  @Post()
  create(@Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.create', { dto, auth });
  }

  @Get()
  findAll(@Query() q: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.findAll', { q, auth });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.findOne', { id, auth });
  }

  @Get('shop/:id')
  getInforShop(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.findOne', { id, auth });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.update', { id, dto, auth });
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.deactivate', { id, auth });
  }
  @Post('seller')
  updateRoleSeller(
  @Body() payload: any,
  @Headers('authorization') auth?: string
) {
  return this.kafka.send('user.updateRoleSeller', {      
    ...payload,    
    auth,          
  });
}

}
