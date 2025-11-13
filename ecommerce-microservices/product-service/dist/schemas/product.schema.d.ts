import { Document } from 'mongoose';
export type ProductDocument = Product & Document;
export declare enum ProductCondition {
    NEW = "new",
    USED = "used"
}
export declare class WarehouseAddress {
    line1: string;
    line2?: string;
    city: string;
    province?: string;
    country?: string;
    postalCode?: string;
}
export declare class Product {
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    stock: number;
    isActive: boolean;
    brand: string;
    condition: ProductCondition;
    tags?: string[];
    images?: string[];
    categoryIds?: string[];
    attributes?: Record<string, any>;
    variants?: Record<string, any>;
    ratingAvg?: number;
    warehouseAddress?: WarehouseAddress;
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, Document<unknown, any, Product, any, {}> & Product & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, import("mongoose").FlatRecord<Product>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Product> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
