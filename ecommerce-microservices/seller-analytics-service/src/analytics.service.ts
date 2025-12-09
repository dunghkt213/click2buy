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

interface OrderConfirmedPayload {
  sellerId: string;
  totalAmount: number;
  confirmedAt?: string | Date;
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
   * Kafka consumer handler for order.confirmed events.
   * Aggregates revenue + product stats inside a Mongo transaction.
   */
  async handleOrderConfirmed(data: OrderConfirmedPayload) {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const normalizedDate = this.normalizeDate(
          data.confirmedAt ? new Date(data.confirmedAt) : new Date(),
        );

        await this.dailyRevenueModel.findOneAndUpdate(
          { sellerId: data.sellerId, date: normalizedDate },
          {
            $inc: {
              totalRevenue: data.totalAmount,
              totalOrders: 1,
            },
            $setOnInsert: {
              sellerId: data.sellerId,
              date: normalizedDate,
            },
          },
          { upsert: true, new: true, session },
        );

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
                ? {
                    $set: { productName: item.productName },
                  }
                : {}),
            },
            { upsert: true, new: true, session },
          );
        }
      });

      this.logger.log(
        `✅ Analytics updated for seller ${data.sellerId} - order.confirmed`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to aggregate analytics for seller ${data.sellerId}: ${error.message}`,
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
      map.set(record.date.toISOString(), record);
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
