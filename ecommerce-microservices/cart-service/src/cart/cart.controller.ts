import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/decorators';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { CheckoutResponseDto } from '../dto/checkout-response.dto';
import { Cart } from '../schemas/cart.schema';

/**
 * Cart Controller
 * Handles all HTTP requests for cart operations
 * All endpoints require JWT authentication
 */
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  /**
   * GET /cart
   * Get user's cart (auto-creates if not exists)
   */
  @Get()
  async getCart(@GetUserId() userId: string): Promise<Cart> {
    this.logger.log(`GET /cart - User: ${userId}`);
    return this.cartService.getCart(userId);
  }

  /**
   * POST /cart/add
   * Add item to cart or increase quantity if already exists
   * Body: { productId: string, quantity: number }
   */
  @Post('add')
  async addToCart(
    @GetUserId() userId: string,
    @Body() dto: AddToCartDto,
  ): Promise<Cart> {
    this.logger.log(
      `POST /cart/add - User: ${userId}, Product: ${dto.productId}`,
    );
    return this.cartService.addToCart(userId, dto);
  }

  /**
   * PATCH /cart/update
   * Update item quantity in cart
   * If quantity = 0, item will be removed
   * Body: { productId: string, quantity: number }
   */
  @Patch('update')
  async updateCart(
    @GetUserId() userId: string,
    @Body() dto: UpdateCartDto,
  ): Promise<Cart> {
    this.logger.log(
      `PATCH /cart/update - User: ${userId}, Product: ${dto.productId}`,
    );
    return this.cartService.updateCart(userId, dto);
  }

  /**
   * DELETE /cart/remove/:productId
   * Remove item from cart completely
   */
  @Delete('remove/:productId')
  async removeFromCart(
    @GetUserId() userId: string,
    @Param('productId') productId: string,
  ): Promise<Cart> {
    this.logger.log(
      `DELETE /cart/remove/${productId} - User: ${userId}`,
    );
    return this.cartService.removeFromCart(userId, productId);
  }

  /**
   * POST /cart/checkout
   * Checkout cart - publishes order.create event
   * Cart will be cleared after successful checkout
   */
  @Post('checkout')
  async checkout(
    @GetUserId() userId: string,
  ): Promise<CheckoutResponseDto> {
    this.logger.log(`POST /cart/checkout - User: ${userId}`);
    return this.cartService.checkout(userId);
  }
}
