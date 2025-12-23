import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  type!: string;  // ORDER | CHAT | SYSTEM...

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata!: Record<string, any>;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
