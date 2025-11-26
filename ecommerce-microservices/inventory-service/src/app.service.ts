// src/app.service.ts

import { Injectable, Logger, Inject, BadRequestException, NotFoundException} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument, InventoryStatus } from './schemas/inventory.schemas';

@Injectable()
export class AppService {

  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,

    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

async reserveStock(data: any ) {
  console.log('reservestock', data)
  const { products,userId,orderIds, paymentMethod, total } = data;
  const results = [];
  for (const { productId, quantity } of products) {
    const inventory = await this.inventoryModel.findOne({ productId });
    
    if (!inventory) {
      results.push({
        productId,
        success: false,
        message: 'Inventory not found',
      });
      continue;
    }

    // Trừ available, tăng reserved
    inventory.availableStock -= quantity;
    inventory.reservedStock += quantity;

    await inventory.save();

    results.push({
      productId,
      success: true,
      reserved: quantity,
    });
  }

  return { success: true, results };
}

async commitStock(data: { order: any }) {
  const { order } = data;

  console.log('commit stock for order', order);

  const results = [];

  for (const { productId, quantity } of order.items) {
    const inventory = await this.inventoryModel.findOne({ productId });

    if (!inventory) {
      results.push({
        productId,
        success: false,
        message: 'Inventory not found'
      });
      continue;
    }

    // Giảm reserved vì hàng đã bán thành công
    inventory.reservedStock -= quantity;

    await inventory.save();

    results.push({
      productId,
      success: true,
      committed: quantity,
      newAvailable: inventory.availableStock,
      newReserved: inventory.reservedStock
    });
  }

  return {
    success: true,
    orderId: order._id,
    results
  };
}

  /**
   * Khi payment thất bại hoặc hủy đơn hàng
   */
  async releaseStock(data: any) {
    console.log('release stock', data);

    for (const item of data.items) {
      const { productId, quantity } = item;

      const inventory = await this.inventoryModel.findOne({ productId });
      if (!inventory) continue;

      inventory.availableStock += quantity;

      inventory.reservedStock -= quantity;

      await inventory.save();
    }

    this.kafka.emit('inventory.released', {
      orderId: data,
    });

    console.log('Emitted inventory.released event for orderId:', data);
    return { success: true };
  }

  // ============================================
  //  Product tạo mới → tạo kho ban đầu
  // ============================================
  async createProductStock(data: { productId: string; stock?: number, ownerId: string }) {
    const { productId, ownerId, stock = 0 } = data;

    const created = await this.inventoryModel.findOneAndUpdate(
      { productId },
      {
        $setOnInsert: {
          productId,
          ownerId,
          availableStock: stock,
          reservedStock: 0,
          status: stock > 0 ? InventoryStatus.IN_STOCK : InventoryStatus.OUT_OF_STOCK,
        },
      },
      { upsert: true, new: true }
    );

    // Emit về product-service xác nhận đã sync
    this.kafka.emit('inventory.synced', { productId });

    return { success: true, data: created };
  }

  // ============================================
  // Product-service hỏi tồn kho
  // ============================================
  async getStock(productId: string) {
    const inv = await this.inventoryModel.findOne({ productId }).lean();

    if (!inv) {
      return { availableStock: 0, reservedStock: 0, status: 'OUT_OF_STOCK' };
    }

    return {
      availableStock: inv.availableStock,
      reservedStock: inv.reservedStock,
      status: inv.status,
    };
  }

  // ============================================
  // Seller chỉnh sửa stock trong product
  // product-service gửi Kafka inventory.updateStock.request
  // ============================================
  async addStock(productId: string, amount: number, ownerId?: string) {
    console.log("🔥 addStock() received →", {
      productId,
      amount,
      ownerId,
      typeOfAmount: typeof amount
    });
    
    if (amount <= 0) {
      throw new BadRequestException('amount must be > 0');
    }

    const inv = await this.inventoryModel.findOne({ productId });

    if (!inv) throw new NotFoundException('Inventory not found');

    // Optional: check permission
    if (ownerId && ownerId !== inv.ownerId) {
      throw new BadRequestException('Permission denied');
    }

    inv.availableStock += amount;

    // Update status tự động
    inv.status = this.resolveStatus(inv);

    await inv.save();

    return {
      success: true,
      message: 'Stock added successfully',
      productId,
      availableStock: inv.availableStock,
    };
  }

  async adjustStock(productId: string, delta: number, ownerId?: string) {
    console.log("🔥 addStock() received →", {
      productId,
      delta,
      ownerId,
      typeOfAmount: typeof delta
    });
    if (delta === 0) {
      throw new BadRequestException('delta must not be 0');
    }

    const inv = await this.inventoryModel.findOne({ productId });

    if (!inv) throw new NotFoundException('Inventory not found');

    // Optional: check permission
    if (ownerId && ownerId !== inv.ownerId) {
      throw new BadRequestException('Permission denied');
    }

    // Nếu delta âm → giảm stock
    const newAvailable = inv.availableStock + delta;
    if (newAvailable < 0) {
      throw new BadRequestException('availableStock cannot go below 0');
    }

    inv.availableStock = newAvailable;

    // auto update status
    inv.status = this.resolveStatus(inv);

    await inv.save();

    return {
      success: true,
      message: 'Stock adjusted successfully',
      productId,
      availableStock: inv.availableStock,
    };
  }

  private resolveStatus(inv: Inventory): InventoryStatus {
    if (inv.availableStock <= 0) return InventoryStatus.OUT_OF_STOCK;
    if (inv.availableStock <= inv.lowStockThreshold) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.IN_STOCK;
  }

  /**
   * Xử lý khi nhận sự kiện order.confirmed từ seller-analytics-service
   * Khi Seller duyệt đơn hàng -> Trừ tồn kho thật (availableStock)
   * Payload: { orderId, items: [{ productId, quantity }] }
   */
  async confirmOrderAndDeductStock(data: any) {
    try {
      const { orderId, items } = data;

      this.logger.log(
        `📥 Received order.confirmed event for order: ${orderId}`,
      );

      if (!items || !Array.isArray(items) || items.length === 0) {
        this.logger.warn(`Order ${orderId} has no items to process`);
        return { success: false, message: 'No items in order' };
      }

      const results = [];

      // Trừ tồn kho cho từng sản phẩm trong danh sách
      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity) {
          this.logger.warn(
            `Invalid item in order ${orderId}: productId=${productId}, quantity=${quantity}`,
          );
          continue;
        }

        try {
          const inventory = await this.inventoryModel.findOne({ productId });

          if (!inventory) {
            this.logger.warn(
              `Product ${productId} not found in inventory for order ${orderId}`,
            );
            results.push({
              productId,
              success: false,
              message: 'Product not found in inventory',
            });
            continue;
          }

          // Kiểm tra tồn kho có đủ không
          if (inventory.availableStock < quantity) {
            this.logger.warn(
              `Insufficient stock for product ${productId}. Available: ${inventory.availableStock}, Required: ${quantity}`,
            );
            results.push({
              productId,
              success: false,
              message: `Insufficient stock. Available: ${inventory.availableStock}`,
            });
            continue;
          }

          // Trừ tồn kho thật
          inventory.availableStock -= quantity;

          // Nếu có reservedStock thì cũng trừ luôn
          if (inventory.reservedStock >= quantity) {
            inventory.reservedStock -= quantity;
          }

          // Update status tự động
          inventory.status = this.resolveStatus(inventory);

          await inventory.save();

          results.push({
            productId,
            success: true,
            deductedQuantity: quantity,
            remainingStock: inventory.availableStock,
          });

          this.logger.log(
            `✅ Stock deducted for product ${productId}: ${quantity} units. Remaining: ${inventory.availableStock}`,
          );
        } catch (error) {
          this.logger.error(
            `❌ Error processing item ${productId} for order ${orderId}: ${error.message}`,
            error.stack,
          );
          results.push({
            productId,
            success: false,
            message: error.message,
          });
        }
      }

      // Log thông báo tổng kết
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        this.logger.log(
          `✅ Order [${orderId}] confirmed. Stock deducted successfully for all items.`,
        );
      } else {
        this.logger.warn(
          `⚠️ Order [${orderId}] confirmed. Stock deducted: ${successCount} success, ${failCount} failed.`,
        );
      }

      return {
        success: failCount === 0,
        orderId,
        results,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error processing order.confirmed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message,
      };
    }
  }

}
