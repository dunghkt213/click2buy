import { WarehouseAddress, ProductCondition } from '../schemas/product.schema';
export declare class ProductDto {
    id: string;
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    stock: number;
    isActive: boolean;
    brand: string;
    condition: ProductCondition;
    categoryIds?: string[];
    tags?: string[];
    images?: string[];
    attributes?: Record<string, any>;
    variants?: Record<string, any>;
    ratingAvg?: number;
    warehouseAddress?: WarehouseAddress;
    createdAt: Date;
    updatedAt: Date;
}
