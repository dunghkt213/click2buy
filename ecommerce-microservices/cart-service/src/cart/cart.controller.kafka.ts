import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartKafkaController {
  private readonly logger = new Logger(CartKafkaController.name);

  constructor(private readonly cartService: CartService) {}

  @MessagePattern('cart.get')
  async handleGetCart(@Payload() payload: any) {
    try {
      const { userId } = payload;

      if (!userId) {
        throw new Error('userId is required');
      }

      this.logger.log(`📨 Processing cart.get for user: ${userId}`);
      const cart = await this.cartService.getCart(userId);

      this.logger.log(`✅ Successfully processed cart.get for user: ${userId}`);
      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      this.logger.error('Error in handleGetCart:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('cart.add')
  async handleAddItem(@Payload() payload: any) {
    try {
      const { userId, productId, quantity, price } = payload;

      if (!userId || !productId || !quantity || price === undefined) {
        throw new Error('userId, productId, quantity, and price are required');
      }

      this.logger.log(`📨 Processing cart.add for user: ${userId}, product: ${productId}`);
      const cart = await this.cartService.addItem(userId, productId, quantity, price);

      this.logger.log(`✅ Successfully processed cart.add for user: ${userId}`);
      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      this.logger.error('Error in handleAddItem:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('cart.update')
  async handleUpdateItem(@Payload() payload: any) {
    try {
      const { userId, productId, quantity } = payload;

      if (!userId || !productId || quantity === undefined) {
        throw new Error('userId, productId, and quantity are required');
      }

      this.logger.log(`📨 Processing cart.update for user: ${userId}, product: ${productId}`);
      const cart = await this.cartService.updateItem(userId, productId, quantity);

      this.logger.log(`✅ Successfully processed cart.update for user: ${userId}`);
      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      this.logger.error('Error in handleUpdateItem:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('cart.remove')
  async handleRemoveItem(@Payload() payload: any) {
    try {
      const { userId, productId } = payload;

      if (!userId || !productId) {
        throw new Error('userId and productId are required');
      }

      this.logger.log(`📨 Processing cart.remove for user: ${userId}, product: ${productId}`);
      const cart = await this.cartService.removeItem(userId, productId);

      this.logger.log(`✅ Successfully processed cart.remove for user: ${userId}`);
      return {
        success: true,
        data: cart,
      };
    } catch (error) {
      this.logger.error('Error in handleRemoveItem:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
