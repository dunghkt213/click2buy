import { Model } from 'mongoose';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review } from 'schemas/review-schema';
export declare class AppService {
    private readonly reviewModel;
    constructor(reviewModel: Model<Review>);
    create(dto: CreateReviewDto, userId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll(q?: any): Promise<{
        success: boolean;
        data: any;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, dto: UpdateReviewDto, userId: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    remove({ id, userId }: {
        id: string;
        userId: string;
    }): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
}
