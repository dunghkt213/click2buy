import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createMongoSchema } from 'src/common/utils/mongo-schema.util';

/**
 * Kiểu tài liệu (document) Mongoose
 */
export type UserDocument = User & Document;

/**
 * Enum quyền của người dùng
 */
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * Subdocument địa chỉ (address)
 */
@Schema({ _id: false })
export class Address {
  @Prop({ required: true, trim: true })
  line1: string;

  @Prop({ trim: true })
  line2?: string;

  @Prop({ required: true, trim: true })
  wardOrDistrict: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ trim: true })
  province?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  postalCode?: string;

  @Prop({ default: false })
  isDefault?: boolean;
}

/**
 * Schema chính cho collection "users"
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash?: string;

  @Prop({ enum: Object.values(UserRole), default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpire?: Date;

  @Prop({ type: [Object], default: [] })
  address: Address[];
}

/**
 * Tạo schema Mongoose từ class User
 */
export const UserSchema = createMongoSchema(User);

/**
 * Các chỉ mục (indexes)
 */
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ username: 'text', email: 'text', phone: 'text' });

/**
 * Ẩn các trường nhạy cảm khi chuyển sang JSON
 */
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

