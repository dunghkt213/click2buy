import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    create({ dto }: any): Promise<{
        success: boolean;
        data: import("mongoose").Document<unknown, {}, import("../schemas/product.schema").Product, {}, {}> & import("../schemas/product.schema").Product & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    findAll({ q }: any): Promise<{
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
    findOne({ id }: any): Promise<{
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
    update({ id, dto }: any): Promise<{
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
    remove({ id }: any): Promise<{
        success: boolean;
        message: string;
    }>;
    search({ q }: any): Promise<{
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
