import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
  ) {}

  /** Lấy tất cả cart chia theo seller của user */
  async getCarts(userId: string) {
    return this.cartModel.find({ userId });
  }


  /** Thêm sản phẩm vào cart của seller */
  async addItem(
    userId: string, 
    dto: { productId: string; quantity: number; price: number; sellerId: string }
  ) {
    const { productId, quantity, price, sellerId } = dto;

    if (!productId || !sellerId) {
      throw new BadRequestException("productId và sellerId là bắt buộc");
    }

    if (quantity < 1) {
      throw new BadRequestException("Số lượng không hợp lệ");
    }

    // Lấy cart theo seller
    let cart = await this.cartModel.findOne({ userId, sellerId }).lean(false);

    if (!cart) {
      cart = new this.cartModel({ userId, sellerId, items: [] });
      await cart.save();
    }

    // Tìm item đã tồn tại chưa
    const existing = cart.items.find(item => item.productId === productId);

    if (existing) {
      // Nếu tồn tại -> tăng số lượng
      existing.quantity += quantity;
      
      // Nếu muốn cập nhật lại giá mới mỗi lần FE thêm vào giỏ
    } else {
      // Chưa tồn tại → thêm mới item
      cart.items.push({ productId, quantity, price });
    }
    return cart.save();
  }


  /** Cập nhật */
  async updateItem(userId: string, sellerId: string, productId: string, quantity: number, price: number) {
    let cart = await this.cartModel.findOne({ userId, sellerId }).lean(false);

    if (!cart) {
      cart = new this.cartModel({ userId, sellerId, items: [] });
      await cart.save();
    }


    const item = cart.items.find(i => i.productId === productId);
    if (!item) throw new NotFoundException('Item not found');
    console.log("item",item)
    if (quantity < 1) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
      item.price = price;
    }

    return cart.save();
  }

  /** Xóa 1 sản phẩm khỏi cart seller */
  async removeItem(userId: string, sellerId: string, productId: string) {
    let cart = await this.cartModel.findOne({ userId, sellerId }).lean(false);

    if (!cart) {
      cart = new this.cartModel({ userId, sellerId, items: [] });
      await cart.save();
    }

    cart.items = cart.items.filter(i => i.productId !== productId);
    return cart.save();
  }
}
