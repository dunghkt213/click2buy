import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common/decorators/core/inject.decorator';
import * as jwt from 'jsonwebtoken';

@Controller('cart')
export class CartGateway {
  constructor(@Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('cart.get');
    this.kafka.subscribeToResponseOf('cart.add');
    this.kafka.subscribeToResponseOf('cart.update');
    this.kafka.subscribeToResponseOf('cart.remove');
    await this.kafka.connect();
  }

  private extractUserId(authHeader?: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }
      return decoded.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Get()
  async getCart(@Headers('authorization') auth?: string) {
    const userId = this.extractUserId(auth);
    const result = await this.kafka.send('cart.get', { userId }).toPromise();
    
    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to get cart');
    }
    
    return result.data;
  }

  @Post('items')
  async addItem(@Body() dto: any, @Headers('authorization') auth?: string) {
    const userId = this.extractUserId(auth);
    
    if (!dto.productId || !dto.quantity || dto.price === undefined) {
      throw new BadRequestException('productId, quantity, and price are required');
    }

    const result = await this.kafka.send('cart.add', {
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
    }).toPromise();
    
    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to add item to cart');
    }
    
    return result.data;
  }

  @Patch('items/:productId')
  async updateItem(
    @Param('productId') productId: string,
    @Body() dto: any,
    @Headers('authorization') auth?: string,
  ) {
    const userId = this.extractUserId(auth);
    
    if (dto.quantity === undefined) {
      throw new BadRequestException('quantity is required');
    }

    const result = await this.kafka.send('cart.update', {
      userId,
      productId,
      quantity: dto.quantity,
    }).toPromise();
    
    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to update item');
    }
    
    return result.data;
  }

  @Delete('items/:productId')
  async removeItem(@Param('productId') productId: string, @Headers('authorization') auth?: string) {
    const userId = this.extractUserId(auth);
    
    const result = await this.kafka.send('cart.remove', {
      userId,
      productId,
    }).toPromise();
    
    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to remove item');
    }
    
    return result.data;
  }
}
