import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DailyRevenue,
  DailyRevenueDocument,
} from '../schemas/daily-revenue.schema';

/**
 * Service xử lý logic tính toán analytics và doanh thu
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(DailyRevenue.name)
    private readonly dailyRevenueModel: Model<DailyRevenueDocument>,
  ) {}

  /**
   * Xử lý sự kiện order.delivery.success từ Kafka
   * Cộng dồn doanh thu và số lượng đơn hàng theo ngày
   */
  async handleDeliverySuccess(data: {
    orderId: string;
    totalAmount: number;
    createdAt?: Date;
  }) {
    try {
      const date = this.getDateString(data.createdAt || new Date());

      // Tìm hoặc tạo DailyRevenue record cho ngày
      await this.dailyRevenueModel.findOneAndUpdate(
        { date },
        {
          $inc: {
            totalRevenue: data.totalAmount,
            orderCount: 1,
          },
        },
        { upsert: true, new: true },
      );

      this.logger.log(
        `✅ Updated daily revenue for order ${data.orderId} on ${date}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling order.delivery.success: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * API: Lấy doanh thu theo khoảng thời gian (WEEK hoặc MONTH)
   * Trả về mảng đầy đủ các ngày, nếu ngày nào không có đơn thì totalRevenue = 0
   */
  async getRevenue(type: 'WEEK' | 'MONTH' = 'WEEK') {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (type === 'WEEK') {
      // Lấy 7 ngày gần nhất
      start = new Date(now);
      start.setDate(start.getDate() - 6); // 7 ngày bao gồm cả hôm nay
    } else {
      // Lấy 30 ngày gần nhất
      start = new Date(now);
      start.setDate(start.getDate() - 29); // 30 ngày bao gồm cả hôm nay
    }

    // Query analytics theo date range
    const revenues = await this.dailyRevenueModel
      .find({
        date: {
          $gte: this.getDateString(start),
          $lte: this.getDateString(end),
        },
      })
      .sort({ date: 1 })
      .exec();

    // Tạo map để lookup nhanh
    const revenueMap = new Map<string, DailyRevenueDocument>();
    revenues.forEach((r) => {
      revenueMap.set(r.date, r);
    });

    // Tạo array đầy đủ các ngày trong khoảng
    const result: Array<{ date: string; totalRevenue: number; orderCount: number }> = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = this.getDateString(currentDate);
      const record = revenueMap.get(dateStr);

      result.push({
        date: dateStr,
        totalRevenue: record ? record.totalRevenue : 0,
        orderCount: record ? record.orderCount : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  /**
   * Helper: Chuyển Date thành string YYYY-MM-DD (set về đầu ngày)
   */
  private getDateString(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

