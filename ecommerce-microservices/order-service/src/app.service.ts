import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import Redis from 'ioredis/built/Redis';
import { firstValueFrom, timeout } from 'rxjs';
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) { }

  async onModuleInit() {
    // Các topic RPC API Gateway phải subscribe để nhận response
    this.kafka.subscribeToResponseOf('product.findOne');
    this.kafka.subscribeToResponseOf('order.created');
    this.kafka.subscribeToResponseOf('order.payment.banking.requested');
    await this.kafka.connect();
  }

  async getProductInfo(productId: string) {
    return this.kafka
      .send('product.findOne', { id: productId })
      .pipe(timeout(3000)) // optional: tránh treo
      .toPromise();
  }

  async getAllOrderForSaller(ownerId: string) {
    try {
      return this.orderModel.find({ ownerId });
    } catch (err) {
      throw err.message;
    }
  }
  async getAllOrderForUser(userId: string) {
    try {
      return this.orderModel.find({ userId });
    } catch (err) {
      throw err.message;
    }
  }
  async createOrders(input: CreateOrderDto) {
    console.log('=>> service order.create')
    const { userId, orderCode, paymentMethod, carts } = input;

    this.validateOrderCode(orderCode);

    const existing = await this.orderModel.findOne({ orderCode });

    if (existing) {
      return {
        success: true,
        duplicate: true,
        orderIds: [existing._id],
        message: 'Order already created, waiting for payment QR',
      };
    }

    const orderIds: string[] = [];
    const products: any[] = [];
    let totalAllOrders = 0;

    for (const cart of carts) {
      const items: any[] = [];
  
      // 1️⃣ Fetch product & validate
      for (const p of cart.products) {
        const product = await this.getProductInfo(p.productId);
        if (!product) {
          throw new NotFoundException(`Product not found: ${p.productId}`);
        }
  
        const finalPrice = product.salePrice ?? product.price;
  
        items.push({
          productId: p.productId,
          quantity: p.quantity,
          price: finalPrice,
        });
  
        products.push({
          productId: p.productId,
          quantity: p.quantity,
        });
      }
  
      // 2️⃣ Subtotal (shop-level)
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
  
      // 3️⃣ Voucher SHOP (demo rule)
      let voucherDiscount = 0;
      if (cart.voucherCode === 'SHOP10') {
        voucherDiscount = Math.min(subtotal * 0.1, 50_000);
      }
  
      // 4️⃣ Shipping & payment discount (shop-level)
      const shippingFee = cart.shippingFee ?? 0;
      const paymentDiscount = cart.paymentDiscount ?? 0;
  
      // 5️⃣ Final total của SHOP
      const finalTotal =
        subtotal + shippingFee - voucherDiscount - paymentDiscount;
  
      // 6️⃣ Save order
      const order = new this.orderModel({
        orderCode,
        userId,
        ownerId: cart.sellerId,
        items,
  
        subtotal,
        shippingFee,
        voucherCode: cart.voucherCode,
        voucherDiscount,
        paymentDiscount,
        finalTotal,
  
        paymentMethod,
        status: 'PENDING_PAYMENT',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
  
      const saved = await order.save();
      orderIds.push(saved._id.toString());
      totalAllOrders += finalTotal;
    }

    console.log('🔥 EMIT order.created PAYLOAD:', {
      userId,
      orderIds,
      orderCode,
      paymentMethod,
      products,
      total: totalAllOrders,
    });

    this.kafka.emit('order.created', {
      userId,
      orderIds,
      orderCode,
      paymentMethod,
      products,
      total: totalAllOrders,
    });

    return {
      success: true, 
      orderIds,
      orderCode,
      message: 'Order created, payment-service dang xu ly'
    };

  }

  async updateOrderStatus_paymentSuccess(dto: {
    userId: string;
    orderIds: string[];
    paymentMethod: string;
    total: number;
    paidAmount: number;
    status: string;
    paymentId: string;
  }) {
    const newStatus = 'PENDING_ACCEPT';

    const result = await this.orderModel.updateMany(
      {
        _id: { $in: dto.orderIds },
        status: 'PENDING_PAYMENT', // 🔐 chống callback lặp
      },
      {
        $set: {
          status: newStatus,
          paymentId: dto.paymentId,
          paymentMethod: dto.paymentMethod,
        },
      },
    );

    return {
      success: true,
      updatedCount: result.modifiedCount,
      status: newStatus,
    };
  }


  async requestBankingForOrders(input: { userId: string; orderCode: string }) {
    const { userId, orderCode } = input;

    this.validateOrderCode(orderCode);

    const orders = await this.orderModel.find({
      orderCode,
      userId,                               // đảm bảo đúng chủ
    });

    if (!orders.length) {
      console.log('Orders not found or not owned by user');
      throw new NotFoundException('Orders not found or not owned by user');
    }

    const totalAllOrders = orders.reduce((sum, o) => sum + o.finalTotal, 0);

    const allowed = [
      'PENDING_PAYMENT',
      'PAYMENT_FAILED',  // thanh toán fail được tạo lại
    ];

    // (optional) kiểm tra status phải là PENDING_PAYMENT
    for (const o of orders) {
      if (!allowed.includes(o.status)) {
        throw new BadRequestException(
          `Order ${o._id} cannot request banking payment in status: ${o.status}`,
        );
      }
    }
    console.log('🔥 EMIT order.payment.banking.requested PAYLOAD:', orderCode)
    // 👉 CHÍNH ORDER-SERVICE là nơi bắn đi event sang payment
    this.kafka.emit('payment.banking.requested', {
      userId,
      orderCode,
      paymentMethod: 'BANKING',
      total: totalAllOrders,   // total lấy từ DB, an toàn
    });

    return {
      success: true,
      message: 'Requested banking payment, waiting for QR',
    };
  }

  /**
   * Seller duyệt đơn hàng - KHÔNG cộng doanh thu ở bước này
   * Chỉ emit event để tracking số đơn được duyệt
   */
  async confirmOrder(orderId: string, sellerId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    if (order.ownerId !== sellerId) {
      throw new BadRequestException('You are not the owner of this order');
    }

    if (order.status !== 'PENDING_ACCEPT') {
      throw new BadRequestException(`Cannot confirm order with status: ${order.status}`);
    }

    order.status = 'CONFIRMED';
    await order.save();

    // 🔔 Event chỉ để tracking - KHÔNG chứa totalAmount để tránh cộng doanh thu
    this.kafka.emit('order.confirmed', {
      orderId: order._id.toString(),
      sellerId: order.ownerId,
      confirmedAt: new Date().toISOString(),
    });

    this.logger.log(`✅ Order ${orderId} confirmed by seller ${sellerId}`);

    return { success: true, status: 'CONFIRMED' };
  }

  /**
   * Seller từ chối đơn hàng
   */
  async rejectOrder(orderId: string, sellerId: string, reason?: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    if (order.ownerId !== sellerId) {
      throw new BadRequestException('You are not the owner of this order');
    }

    if (order.status !== 'PENDING_ACCEPT') {
      throw new BadRequestException(`Cannot reject order with status: ${order.status}`);
    }

    order.status = 'REJECTED';
    await order.save();

    // Emit event để các service khác xử lý (hoàn tiền, restock, notify user...)
    this.kafka.emit('order.rejected', {
      orderId: order._id.toString(),
      sellerId: order.ownerId,
      userId: order.userId,
      reason: reason || 'Seller rejected the order',
      rejectedAt: new Date().toISOString(),
      items: order.items,
    });

    this.logger.log(`❌ Order ${orderId} rejected by seller ${sellerId}`);

    return { success: true, status: 'REJECTED' };
  }

  /**
   * Đánh dấu đơn hàng đã giao thành công - CẬP NHẬT DOANH THU TẠI ĐÂY
   */
  async completeOrder(orderId: string, sellerId: string) {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    if (order.ownerId !== sellerId) {
      throw new BadRequestException('You are not the owner of this order');
    }

    // Chỉ cho phép complete từ trạng thái CONFIRMED hoặc SHIPPING
    const allowedStatuses = ['CONFIRMED', 'SHIPPING'];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(`Cannot complete order with status: ${order.status}`);
    }

    order.status = 'DELIVERED';
    await order.save();

    // 🔥 EMIT EVENT ĐỂ CỘNG DOANH THU - Chỉ khi giao hàng thành công
    this.kafka.emit('order.completed', {
      orderId: order._id.toString(),
      sellerId: order.ownerId,
      totalAmount: order.finalTotal,
      completedAt: new Date().toISOString(),
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    this.logger.log(`🎉 Order ${orderId} delivered, revenue event emitted`);

    return { success: true, status: 'DELIVERED' };
  }

  private validateOrderCode(orderCode: string) {
    if (!orderCode) {
      throw new RpcException({
        statusCode: 400,
        message: 'orderCode is required',
      });
    }

    // FE gửi Date.now().toString()
    if (!/^\d{10,16}$/.test(orderCode)) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid orderCode format',
      });

    }
  }

}
