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
        data: import("mongoose").Document<unknown, {}, Review, {}, {}> & Review & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    findAll(q?: any): Promise<{
        success: boolean;
        data: (import("mongoose").FlattenMaps<{
            productId: string;
            userId: string;
            rating: number;
            comment?: string | undefined;
            images: string[];
            isApproved: boolean;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("mongoose").FlattenMaps<{
            productId: string;
            userId: string;
            rating: number;
            comment?: string | undefined;
            images: string[];
            isApproved: boolean;
        }> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    update(id: string, dto: UpdateReviewDto, userId: string): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, Review, {}, {}> & Review & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
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
