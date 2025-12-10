import { Injectable, Logger } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";
import {
  DailyRevenue,
  DailyRevenueDocument,
} from "./schemas/daily-revenue.schema";
import {
  ProductAnalytics,
  ProductAnalyticsDocument,
} from "./schemas/product-analytics.schema";

// Payload khi Seller duyệt đơn - KHÔNG chứa totalAmount
interface OrderConfirmedPayload {
  orderId: string;
  sellerId: string;
  confirmedAt?: string | Date;
}

// Payload khi đơn hàng giao thành công - CHỨA totalAmount để cộng doanh thu
interface OrderCompletedPayload {
  orderId: string;
  sellerId: string;
  totalAmount: number;
  completedAt?: string | Date;
  items?: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    price?: number;
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(DailyRevenue.name)
    private readonly dailyRevenueModel: Model<DailyRevenueDocument>,
    @InjectModel(ProductAnalytics.name)
    private readonly productAnalyticsModel: Model<ProductAnalyticsDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Handler khi Seller duyệt đơn - CHỈ đếm số đơn được duyệt, KHÔNG cộng doanh thu
   */
  async handleOrderConfirmed(data: OrderConfirmedPayload) {
    try {
      const normalizedDate = this.normalizeDate(
        data.confirmedAt ? new Date(data.confirmedAt) : new Date(),
      );

      // Chỉ tăng totalOrders (số đơn được duyệt), KHÔNG tăng totalRevenue
      await this.dailyRevenueModel.findOneAndUpdate(
        { sellerId: data.sellerId, date: normalizedDate },
        {
          $inc: { totalOrders: 1 },
          $setOnInsert: {
            sellerId: data.sellerId,
            date: normalizedDate,
            totalRevenue: 0,
          },
        },
        { upsert: true, new: true },
      );

      this.logger.log(
        `📊 Order count updated for seller ${data.sellerId} - order.confirmed (no revenue added)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process order.confirmed for seller ${data.sellerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handler khi đơn hàng giao thành công - CỘNG DOANH THU TẠI ĐÂY
   */
  async handleOrderCompleted(data: OrderCompletedPayload) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const normalizedDate = this.normalizeDate(
          data.completedAt ? new Date(data.completedAt) : new Date(),
        );

        // Cộng doanh thu khi đơn hàng hoàn tất
        await this.dailyRevenueModel.findOneAndUpdate(
          { sellerId: data.sellerId, date: normalizedDate },
          {
            $inc: { totalRevenue: data.totalAmount },
            $setOnInsert: {
              sellerId: data.sellerId,
              date: normalizedDate,
              totalOrders: 0,
            },
          },
          { upsert: true, new: true, session },
        );

        // Cập nhật thống kê sản phẩm
        for (const item of data.items || []) {
          const quantity = item.quantity ?? 0;
          const price = item.price ?? 0;
          const revenue = quantity * price;

          await this.productAnalyticsModel.findOneAndUpdate(
            {
              sellerId: data.sellerId,
              productId: item.productId,
            },
            {
              $inc: {
                totalSold: quantity,
                totalRevenue: revenue,
              },
              $setOnInsert: {
                sellerId: data.sellerId,
                productId: item.productId,
              },
              ...(item.productName
                ? { $set: { productName: item.productName } }
                : {}),
            },
            { upsert: true, new: true, session },
          );
        }
      });

      this.logger.log(
        `💰 Revenue updated for seller ${data.sellerId} - order.completed (+${data.totalAmount})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to aggregate revenue for seller ${data.sellerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Revenue API - returns a full series (no gaps) within the provided window.
   */
  async getRevenue(
    sellerId: string,
    type: "WEEK" | "MONTH" = "WEEK",
  ): Promise<
    Array<{ date: string; totalRevenue: number; totalOrders: number }>
  > {
    const now = this.normalizeDate(new Date());
    const days = type === "MONTH" ? 29 : 6;
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    const revenues = await this.dailyRevenueModel
      .find({
        sellerId,
        date: {
          $gte: start,
          $lte: now,
        },
      })
      .sort({ date: 1 })
      .exec();

    const map = new Map<string, DailyRevenueDocument>();
    revenues.forEach((record) => {
      // Normalize date để khớp với cursor date
      const normalizedDate = this.normalizeDate(record.date);
      map.set(normalizedDate.toISOString(), record);
    });

    const result: Array<{
      date: string;
      totalRevenue: number;
      totalOrders: number;
    }> = [];

    const cursor = new Date(start);
    while (cursor <= now) {
      const iso = cursor.toISOString();
      const record = map.get(iso);

      result.push({
        date: iso.split("T")[0],
        totalRevenue: record?.totalRevenue ?? 0,
        totalOrders: record?.totalOrders ?? 0,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  /**
   * Top products API - returns aggregated stats sorted by totalSold desc.
   */
  async getTopProducts(sellerId: string, limit = 5) {
    return this.productAnalyticsModel
      .find({ sellerId })
      .sort({ totalSold: -1, totalRevenue: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }


}
