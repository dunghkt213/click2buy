import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
export declare class AppService {
    private readonly productModel;
    constructor(productModel: Model<Product>);
    create(dto: CreateProductDto): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    findAll(q?: any): Promise<{
        success: boolean;
        data: (import("mongoose").FlattenMaps<{
            name: string;
            description?: string | undefined;
            price: number;
            salePrice?: number | undefined;
            stock: number;
            isActive: boolean;
            brand: string;
            condition: import("../schemas/product.schema").ProductCondition;
            tags?: string[] | undefined;
            images?: string[] | undefined;
            categoryIds?: string[] | undefined;
            attributes?: {
                [x: string]: any;
            } | undefined;
            variants?: {
                [x: string]: any;
            } | undefined;
            ratingAvg?: number | undefined;
            warehouseAddress?: {
                line1: string;
                line2?: string | undefined;
                city: string;
                province?: string | undefined;
                country?: string | undefined;
                postalCode?: string | undefined;
            } | undefined;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").FlattenMaps<{
            name: string;
            description?: string | undefined;
            price: number;
            salePrice?: number | undefined;
            stock: number;
            isActive: boolean;
            brand: string;
            condition: import("../schemas/product.schema").ProductCondition;
            tags?: string[] | undefined;
            images?: string[] | undefined;
            categoryIds?: string[] | undefined;
            attributes?: {
                [x: string]: any;
            } | undefined;
            variants?: {
                [x: string]: any;
            } | undefined;
            ratingAvg?: number | undefined;
            warehouseAddress?: {
                line1: string;
                line2?: string | undefined;
                city: string;
                province?: string | undefined;
                country?: string | undefined;
                postalCode?: string | undefined;
            } | undefined;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        success: boolean;
        data: import("mongoose").FlattenMaps<{
            name: string;
            description?: string | undefined;
            price: number;
            salePrice?: number | undefined;
            stock: number;
            isActive: boolean;
            brand: string;
            condition: import("../schemas/product.schema").ProductCondition;
            tags?: string[] | undefined;
            images?: string[] | undefined;
            categoryIds?: string[] | undefined;
            attributes?: {
                [x: string]: any;
            } | undefined;
            variants?: {
                [x: string]: any;
            } | undefined;
            ratingAvg?: number | undefined;
            warehouseAddress?: {
                line1: string;
                line2?: string | undefined;
                city: string;
                province?: string | undefined;
                country?: string | undefined;
                postalCode?: string | undefined;
            } | undefined;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    search(q: any): Promise<{
        success: boolean;
        data: (import("mongoose").FlattenMaps<{
            name: string;
            description?: string | undefined;
            price: number;
            salePrice?: number | undefined;
            stock: number;
            isActive: boolean;
            brand: string;
            condition: import("../schemas/product.schema").ProductCondition;
            tags?: string[] | undefined;
            images?: string[] | undefined;
            categoryIds?: string[] | undefined;
            attributes?: {
                [x: string]: any;
            } | undefined;
            variants?: {
                [x: string]: any;
            } | undefined;
            ratingAvg?: number | undefined;
            warehouseAddress?: {
                line1: string;
                line2?: string | undefined;
                city: string;
                province?: string | undefined;
                country?: string | undefined;
                postalCode?: string | undefined;
            } | undefined;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
}
