import { Document } from 'mongoose';
export type ReviewDocument = Review & Document;
export declare class Review {
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
    images: string[];
    isApproved: boolean;
}
export declare const ReviewSchema: any;
