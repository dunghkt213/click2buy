import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DailyRevenueDocument = DailyRevenue & Document;

/**
 * Daily revenue aggregation per seller.
 * Stored by day (00:00 UTC) for easier charting.
 */
@Schema({ timestamps: true })
export class DailyRevenue {
  @Prop({ required: true, index: true })
  sellerId: string;

  @Prop({ required: true, index: true })
  date: Date; // normalized to start of day

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  totalOrders: number;
}

export const DailyRevenueSchema = SchemaFactory.createForClass(DailyRevenue);
DailyRevenueSchema.index({ sellerId: 1, date: 1 }, { unique: true });
