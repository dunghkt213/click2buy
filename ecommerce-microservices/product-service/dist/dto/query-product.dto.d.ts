import { ProductCondition } from '../schemas/product.schema';
export declare class QueryProductDto {
    text?: string;
    brand?: string;
    categoryId?: string;
    tags?: string[];
    condition?: ProductCondition;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    isActive?: boolean;
    sortBy?: 'price' | 'ratingAvg' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
