import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schema/cart.schema';
import { AddToCartDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private readonly cartModel: Model<Cart>) {}

  // 🧩 Lấy giỏ hàng của user
  async getUserCart(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.cartModel.findOne({ userId: userObjectId }).lean();
  }

  // 🛒 Thêm sản phẩm vào giỏ hàng (tự tạo giỏ nếu chưa có)
  async addToCart(userId: string, dto: AddToCartDto) {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(dto.productId);

    let cart = await this.cartModel.findOne({ userId: userObjectId });

    // 🆕 Nếu chưa có giỏ → tạo mới
    if (!cart) {
      return this.cartModel.create({
        userId: userObjectId,
        items: [{ productId: productObjectId, quantity: dto.quantity }],
      });
    }

    // 🔁 Nếu đã có giỏ → thêm hoặc cộng dồn
    const item = cart.items.find((i) => i.productId.equals(productObjectId));
    if (item) {
      item.quantity += dto.quantity;
    } else {
      cart.items.push({ productId: productObjectId, quantity: dto.quantity });
    }

    await cart.save();
    return cart;
  }

  // ✏️ Cập nhật số lượng sản phẩm trong giỏ
  async updateQuantity(userId: string, dto: UpdateCartItemDto) {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(dto.productId);

    const cart = await this.cartModel.findOne({ userId: userObjectId });
    if (!cart) return null;

    const item = cart.items.find((i) => i.productId.equals(productObjectId));
    if (item) item.quantity = dto.quantity;

    await cart.save();
    return cart;
  }

  // ❌ Xóa 1 sản phẩm khỏi giỏ hàng
  async removeItem(userId: string, productId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    const cart = await this.cartModel.findOne({ userId: userObjectId });
    if (!cart) return null;

    cart.items = cart.items.filter((i) => !i.productId.equals(productObjectId));
    await cart.save();
    return cart;
  }

  // 🧹 Xóa toàn bộ giỏ hàng
  async clearCart(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    return this.cartModel.findOneAndUpdate(
      { userId: userObjectId },
      { items: [] },
      { new: true },
    );
  }
}
