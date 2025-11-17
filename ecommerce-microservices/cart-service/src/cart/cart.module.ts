import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from '../schemas/cart.schema';
import { KafkaModule } from '../kafka/kafka.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Cart Module
 * Encapsulates all cart-related functionality
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    KafkaModule,
    AuthModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
