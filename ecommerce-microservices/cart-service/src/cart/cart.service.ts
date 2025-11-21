import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  /**
   * Lấy giỏ hàng của user
   * Nếu chưa có thì tạo mới
   */
  async getCart(userId: string) {
    try {
      this.logger.log(`🔍 Getting cart for user: ${userId}`);
      
      let cart = await this.cartModel.findOne({ userId }).exec();
      
      if (!cart) {
        this.logger.log(`📦 Creating new cart for user: ${userId}`);
        cart = await this.cartModel.create({
          userId,
          items: [],
          discount: 5,
          freeShipping: true,
        });
      }

      const total = this.calculateTotal(cart.items);
      const discountAmount = (total * cart.discount) / 100;
      const finalTotal = total - discountAmount;

      return {
        userId: cart.userId,
        items: cart.items,
        total,
        discount: cart.discount,
        discountAmount,
        finalTotal,
        freeShipping: cart.freeShipping,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    } catch (error) {
      this.logger.error(`❌ Error getting cart for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItem(userId: string, productId: string, quantity: number, price: number) {
    try {
      this.logger.log(`➕ Adding item to cart - User: ${userId}, Product: ${productId}, Qty: ${quantity}`);

      if (quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      if (price < 0) {
        throw new BadRequestException('Price must be non-negative');
      }

      let cart = await this.cartModel.findOne({ userId }).exec();

      if (!cart) {
        cart = await this.cartModel.create({
          userId,
          items: [],
          discount: 5,
          freeShipping: true,
        });
      }

      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItemIndex = cart.items.findIndex(
        item => item.productId === productId,
      );

      if (existingItemIndex >= 0) {
        // Nếu đã có thì cộng thêm số lượng
        cart.items[existingItemIndex].quantity += quantity;
        cart.items[existingItemIndex].price = price; // Update giá mới nhất
      } else {
        // Nếu chưa có thì thêm mới
        cart.items.push({ productId, quantity, price });
      }

      await cart.save();

      const total = this.calculateTotal(cart.items);
      const discountAmount = (total * cart.discount) / 100;
      const finalTotal = total - discountAmount;

      this.logger.log(`✅ Item added successfully to cart for user ${userId}`);

      return {
        userId: cart.userId,
        items: cart.items,
        total,
        discount: cart.discount,
        discountAmount,
        finalTotal,
        freeShipping: cart.freeShipping,
      };
    } catch (error) {
      this.logger.error(`❌ Error adding item to cart:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật số lượng sản phẩm
   */
  async updateItem(userId: string, productId: string, quantity: number) {
    try {
      this.logger.log(`🔄 Updating item in cart - User: ${userId}, Product: ${productId}, New Qty: ${quantity}`);

      if (quantity < 0) {
        throw new BadRequestException('Quantity must be non-negative');
      }

      const cart = await this.cartModel.findOne({ userId }).exec();

      if (!cart) {
        throw new NotFoundException(`Cart not found for user ${userId}`);
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex < 0) {
        throw new NotFoundException(`Product ${productId} not found in cart`);
      }

      if (quantity === 0) {
        // Nếu quantity = 0 thì xóa sản phẩm
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();

      const total = this.calculateTotal(cart.items);
      const discountAmount = (total * cart.discount) / 100;
      const finalTotal = total - discountAmount;

      this.logger.log(`✅ Item updated successfully in cart for user ${userId}`);

      return {
        userId: cart.userId,
        items: cart.items,
        total,
        discount: cart.discount,
        discountAmount,
        finalTotal,
        freeShipping: cart.freeShipping,
      };
    } catch (error) {
      this.logger.error(`❌ Error updating item in cart:`, error);
      throw error;
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeItem(userId: string, productId: string) {
    try {
      this.logger.log(`🗑️ Removing item from cart - User: ${userId}, Product: ${productId}`);

      const cart = await this.cartModel.findOne({ userId }).exec();

      if (!cart) {
        throw new NotFoundException(`Cart not found for user ${userId}`);
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex < 0) {
        throw new NotFoundException(`Product ${productId} not found in cart`);
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();

      const total = this.calculateTotal(cart.items);
      const discountAmount = (total * cart.discount) / 100;
      const finalTotal = total - discountAmount;

      this.logger.log(`✅ Item removed successfully from cart for user ${userId}`);

      return {
        userId: cart.userId,
        items: cart.items,
        total,
        discount: cart.discount,
        discountAmount,
        finalTotal,
        freeShipping: cart.freeShipping,
      };
    } catch (error) {
      this.logger.error(`❌ Error removing item from cart:`, error);
      throw error;
    }
  }

  /**
   * Tính tổng giá trị giỏ hàng
   */
  private calculateTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
