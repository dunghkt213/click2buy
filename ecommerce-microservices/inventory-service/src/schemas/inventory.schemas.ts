// src/schemas/inventory.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryDocument = Inventory & Document;


export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',        // còn hàng
  LOW_STOCK = 'LOW_STOCK',      // sắp hết (ví dụ < 5)
  OUT_OF_STOCK = 'OUT_OF_STOCK',// hết hàng
  DISCONTINUED = 'DISCONTINUED' // ngừng kinh doanh (product deleted/disabled)
}


@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true, unique: true })
  productId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ default: 0, min: 0 })
  availableStock: number;

  @Prop({ default: 0, min: 0 })
  reservedStock: number;

  @Prop({ default: 5 })
  lowStockThreshold: number;

  @Prop({
    enum: InventoryStatus,
    default: InventoryStatus.IN_STOCK,
  })
  status: InventoryStatus;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
