import { Injectable, NotFoundException, BadRequestException, Inject} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
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
    console.log('userId: ',userId, typeof(userId))
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

  async removeItem(
  userId: string,
  sellerId: string,
  productId: string
) {
  // 1. Tìm cart theo user + seller
  let cart = await this.cartModel.findOne({ userId, sellerId });

  if (!cart) {
    throw new NotFoundException("Cart not found");
  }

  // 2. Kiểm tra xem product có tồn tại trong cart không
  const existed = cart.items.some(i => i.productId === productId);
  if (!existed) {
    throw new NotFoundException("Item not found in cart");
  }

  // 3. Xóa product ra khỏi mảng
  cart.items = cart.items.filter(i => i.productId !== productId);

  // 4. Nếu giỏ hàng trống → xóa nguyên cart
  if (cart.items.length === 0) {
    await cart.deleteOne();
    return { success: true, message: "Cart removed because it became empty" };
  }

  // 5. Nếu vẫn còn items → lưu lại
  await cart.save();
  return { success: true, message: "Item removed from cart" };
}


  async updateQuantity(
  userId: string,
  sellerId: string,
  productId: string,
  quantity: number 
  ) {
    let cart = await this.cartModel.findOne({ userId, sellerId });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(i => i.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // cập nhật số lượng
    item.quantity = quantity;

    // nếu quantity giảm xuống 0 hoặc thấp hơn → xóa item
    if (item.quantity < 1) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    }

    return cart.save();
  }

  async clearCartAfterPayment(data: {
    userId: string;
    items: { sellerId: string; productId: string }[];
  }) {
    const { userId, items } = data;
  
    if (!userId || !items || items.length === 0) {
      return;
    }
  
    // Group productIds theo sellerId
    const map = new Map<string, string[]>();
  
    for (const item of items) {
      if (!map.has(item.sellerId)) {
        map.set(item.sellerId, []);
      }
      map.get(item.sellerId)!.push(item.productId);
    }
  
    // Xử lý từng seller cart
    for (const [sellerId, productIds] of map.entries()) {
      const cart = await this.cartModel.findOne({ userId, sellerId });
  
      if (!cart) continue;
  
      // Remove purchased products
      cart.items = cart.items.filter(
        item => !productIds.includes(item.productId),
      );
  
      // Nếu cart trống → xóa cart
      if (cart.items.length === 0) {
        await cart.deleteOne();
      } else {
        await cart.save();
      }
    }
  }
  
  
}

