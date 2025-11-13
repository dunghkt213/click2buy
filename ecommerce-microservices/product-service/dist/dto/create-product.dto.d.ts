import { ProductCondition, WarehouseAddress } from '../schemas/product.schema';
export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    salePrice?: number;
    stock?: number;
    brand: string;
    condition?: ProductCondition;
    categoryIds?: string[];
    tags?: string[];
    images?: string[];
    attributes?: Record<string, any>;
    variants?: Record<string, any>;
    warehouseAddress?: WarehouseAddress;
}
