import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from '../schemas/cart.schema';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { CheckoutResponseDto } from '../dto/checkout-response.dto';

/**
 * Cart Service
 * Handles all business logic for cart operations
 */
@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  /**
   * Get user's cart or create empty cart if not exists
   * @param userId - User ID from JWT token
   * @returns User's cart
   */
  async getCart(userId: string): Promise<Cart> {
    this.logger.log(`Getting cart for user: ${userId}`);

    let cart = await this.cartModel.findOne({ userId }).exec();

    // Auto-create empty cart if not exists
    if (!cart) {
      this.logger.log(`Cart not found, creating new cart for user: ${userId}`);
      cart = await this.cartModel.create({
        userId,
        items: [],
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   * If item already exists, increase quantity
   * @param userId - User ID from JWT token
   * @param dto - Add to cart data
   * @returns Updated cart
   */
  async addToCart(userId: string, dto: AddToCartDto): Promise<Cart> {
    this.logger.log(
      `Adding to cart - User: ${userId}, Product: ${dto.productId}, Qty: ${dto.quantity}`,
    );

    const { productId, quantity } = dto;

    // Get or create cart
    let cart = await this.getCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (existingItemIndex >= 0) {
      // Item exists - increase quantity
      cart.items[existingItemIndex].quantity += quantity;
      this.logger.log(
        `Updated existing item - New quantity: ${cart.items[existingItemIndex].quantity}`,
      );
    } else {
      // New item - add to cart
      cart.items.push({ productId, quantity });
      this.logger.log(`Added new item to cart`);
    }

    // Save cart to database
    cart = await cart.save();

    // Publish Kafka event to reserve inventory
    try {
      await this.kafkaProducer.publishInventoryReserve(
        userId,
        productId,
        quantity,
      );
      this.logger.log(`Published inventory.reserve event`);
    } catch (error) {
      this.logger.error('Failed to publish inventory.reserve event', error);
      // Continue - cart is already saved
    }

    return cart;
  }

  /**
   * Update cart item quantity
   * If quantity is 0, remove the item
   * @param userId - User ID from JWT token
   * @param dto - Update cart data
   * @returns Updated cart
   */
  async updateCart(userId: string, dto: UpdateCartDto): Promise<Cart> {
    this.logger.log(
      `Updating cart - User: ${userId}, Product: ${dto.productId}, New Qty: ${dto.quantity}`,
    );

    const { productId, quantity } = dto;

    const cart = await this.getCart(userId);

    // Find the item
    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex < 0) {
      throw new NotFoundException(
        `Product ${productId} not found in cart`,
      );
    }

    const oldQuantity = cart.items[itemIndex].quantity;

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
      this.logger.log(`Removed item from cart`);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      this.logger.log(`Updated item quantity`);
    }

    // Save cart
    const updatedCart = await cart.save();

    // Publish Kafka event to update inventory reservation
    try {
      await this.kafkaProducer.publishInventoryUpdateReservation(
        userId,
        productId,
        oldQuantity,
        quantity,
      );
      this.logger.log(`Published inventory.update-reservation event`);
    } catch (error) {
      this.logger.error(
        'Failed to publish inventory.update-reservation event',
        error,
      );
    }

    return updatedCart;
  }

  /**
   * Remove item from cart completely
   * @param userId - User ID from JWT token
   * @param productId - Product ID to remove
   * @returns Updated cart
   */
  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    this.logger.log(`Removing item - User: ${userId}, Product: ${productId}`);

    const cart = await this.getCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex < 0) {
      throw new NotFoundException(
        `Product ${productId} not found in cart`,
      );
    }

    const removedQuantity = cart.items[itemIndex].quantity;

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Save cart
    const updatedCart = await cart.save();

    // Publish event to release inventory reservation
    try {
      await this.kafkaProducer.publishInventoryUpdateReservation(
        userId,
        productId,
        removedQuantity,
        0,
      );
      this.logger.log(`Published inventory release event`);
    } catch (error) {
      this.logger.error('Failed to publish inventory release event', error);
    }

    return updatedCart;
  }

  /**
   * Checkout - validate cart and publish order.create event
   * Cart will be cleared after successful checkout
   * @param userId - User ID from JWT token
   * @returns Checkout response
   */
  async checkout(userId: string): Promise<CheckoutResponseDto> {
    this.logger.log(`Processing checkout for user: ${userId}`);

    const cart = await this.getCart(userId);

    // Validate cart has items
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Prepare items for order
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      // Publish order.create event to order-service
      await this.kafkaProducer.publishOrderCreate(userId, orderItems);
      this.logger.log(`Published order.create event with ${orderItems.length} items`);

      // Clear cart after successful checkout
      cart.items = [];
      await cart.save();
      this.logger.log(`Cart cleared after checkout`);

      return {
        success: true,
        message: 'Checkout successful. Order is being processed.',
        itemCount: orderItems.length,
      };
    } catch (error) {
      this.logger.error('Failed to process checkout', error);
      throw new BadRequestException('Failed to process checkout');
    }
  }
}
