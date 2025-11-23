// src/app.service.ts

import { Injectable, Logger, Inject, BadRequestException, NotFoundException} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument, InventoryStatus } from './schemas/inventory.schemas';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,

    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

  async reserveStock(data: any) {
    this.logger.log('reserve stock', data);

    const results = [];

    for (const item of data.items) {
      const { productId, quantity } = item;

      let inventory = await this.inventoryModel.findOne({ productId });

      inventory.availableStock -= quantity;

      inventory.reservedStock += quantity;

      await inventory.save();
    }

    // 🔥 Emit event cho Order-Service
    this.kafka.emit('inventory.reserved', data);
    console.log('Emitted inventory.reserved event for orderId:', data);
    return { success: true, items: results };
  }

  /**
   * Khi payment thất bại hoặc hủy đơn hàng
   */
  async releaseStock(data: any) {
    this.logger.log('release stock', data);

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


}
