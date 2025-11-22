// src/app.service.ts

import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schemas';

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
}
