import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { createMongoSchema } from 'src/common/utils/mongo-schema.util';

/**
 * Kiểu tài liệu Mongoose
 */
export type ProductDocument = Product & Document;

/**
 * Enum tình trạng sản phẩm
 */
export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
}

/**
 * Schema phụ - địa chỉ kho hàng
 */
@Schema({ _id: false })
export class WarehouseAddress {
  @Prop({ required: true, trim: true })
  line1: string;

  @Prop({ trim: true })
  line2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ trim: true })
  province?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  postalCode?: string;
}

/**
 * Schema chính cho collection "products"
 */
@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  salePrice?: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true, trim: true })
  brand: string;

  @Prop({ enum: Object.values(ProductCondition), default: ProductCondition.NEW })
  condition: ProductCondition;

  @Prop([{ type: String }])
  tags?: string[];

  @Prop([{ type: String }])
  images?: string[];

  @Prop({ type: [String], ref: 'Category' })
  categoryIds?: string[];

  @Prop({ type: Object })
  attributes?: Record<string, any>;

  @Prop({ type: Object })
  variants?: Record<string, any>;

  @Prop({ default: 0 })
  ratingAvg?: number;

  @Prop({ type: WarehouseAddress })
  warehouseAddress?: WarehouseAddress;
}

/**
 * Tạo schema Mongoose từ class Product
 */
export const ProductSchema = createMongoSchema(Product);

/**
 * Các chỉ mục hỗ trợ search/filter
 */
ProductSchema.index({ name: 'text', brand: 'text', tags: 'text', description: 'text' }); // search từ khóa
ProductSchema.index({ brand: 1 });
ProductSchema.index({ ratingAvg: -1 });
ProductSchema.index({ categoryIds: 1 });
ProductSchema.index({ condition: 1 });
ProductSchema.index({ isActive: 1 });
