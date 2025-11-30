import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProductAnalyticsDocument = ProductAnalytics & Document;

/**
 * Aggregated stats per product per seller to drive top-product charts.
 */
@Schema({ timestamps: true })
export class ProductAnalytics {
  @Prop({ required: true, index: true })
  sellerId: string;

  @Prop({ required: true })
  productId: string;

  @Prop()
  productName: string;

  @Prop({ default: 0 })
  totalSold: number;

  @Prop({ default: 0 })
  totalRevenue: number;
}

export const ProductAnalyticsSchema =
  SchemaFactory.createForClass(ProductAnalytics);

ProductAnalyticsSchema.index({ sellerId: 1, productId: 1 }, { unique: true });
