// src/schemas/inventory.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ required: true, unique: true })
  productId: string;

  @Prop({ default: 0 })
  availableStock: number;

  @Prop({ default: 0 })
  reservedStock: number;

  @Prop({ default: 'IN_STOCK' })
  status: string;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
