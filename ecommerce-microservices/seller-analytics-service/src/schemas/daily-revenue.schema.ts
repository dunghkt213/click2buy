import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyRevenueDocument = DailyRevenue & Document;

/**
 * Schema lưu doanh thu theo ngày
 * Được cập nhật khi nhận event order.delivery.success
 */
@Schema({ timestamps: true })
export class DailyRevenue {
  @Prop({ required: true, unique: true, index: true })
  date: string; // Format: YYYY-MM-DD (set về đầu ngày)

  @Prop({ default: 0 })
  totalRevenue: number; // Tổng doanh thu trong ngày

  @Prop({ default: 0 })
  orderCount: number; // Số lượng đơn hàng thành công
}

export const DailyRevenueSchema = SchemaFactory.createForClass(DailyRevenue);

