import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import {
  CreateNotificationDto,
  FindByUserDto,
  MarkAsReadDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notiModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto) {
    try {
      const data = await this.notiModel.create(dto);

      return { success: true, data };
    } catch (error) {
      this.logger.error(error.message);
      return { success: false, error: error.message };
    }
  }

  async findByUser(dto: FindByUserDto) {
    try {
      const list = await this.notiModel
        .find({ userId: dto.userId })
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, data: list };
    } catch (error) {
      this.logger.error(error.message);
      return { success: false, error: error.message };
    }
  }

  async unreadCount(userId: string) {
    try {
      const count = await this.notiModel.countDocuments({
        userId,
        isRead: false,
      });

      return { success: true, data: { unreadCount: count } };
    } catch (error) {
      this.logger.error(error.message);
      return { success: false, error: error.message };
    }
  }

  async markAsRead(dto: MarkAsReadDto) {
    try {
      const notiId = new Types.ObjectId(dto.notificationId);

      const updated = await this.notiModel.findOneAndUpdate(
        { _id: notiId, userId: dto.userId },
        { isRead: true, readAt: new Date() },
        { new: true },
      );

      return { success: true, data: updated };
    } catch (error) {
      this.logger.error(error.message);
      return { success: false, error: error.message };
    }
  }
}
