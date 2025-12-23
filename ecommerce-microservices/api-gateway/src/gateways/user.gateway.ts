import { Body, Controller, Delete, Get, Param, Res,Post, Put, Query, Headers, HttpException, Patch } from '@nestjs/common';
import  {ClientKafka}from '@nestjs/microservices';
import {Inject} from '@nestjs/common/decorators/core/inject.decorator';
import type { Response, Request } from 'express';
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.update', { id, dto, auth });
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Headers('authorization') auth?: string) {
    return this.kafka.send('user.deactivate', { id, auth });
  }

@Post('seller')
async updateRoleSeller(
  @Body() payload: any,
  @Headers('authorization') auth: string,
  @Res({ passthrough: true }) res: Response
) {
  try {
    const result = await this.kafka.send(
      'user.updateRoleSeller',
      { payload, auth }
    ).toPromise();

    console.log("📥 RESULT FROM MS:",result);
    if (!result?.user || !result?.accessToken) {
      throw new HttpException('Invalid response from user.updateRoleSeller', 500);
    }

    const { user, accessToken, refreshTokenInfo } = result;

    // optional guard để tránh crash
    if (refreshTokenInfo) {
      res.cookie(
        refreshTokenInfo.name,
        refreshTokenInfo.value,
        refreshTokenInfo.options
      );
    }

    return { user, accessToken };

  } catch (error) {
    console.log("❌ Gateway error:", error);

    throw new HttpException(
      error?.message || 'Internal server error',
      error?.status || 500
    );
  }
}

}
