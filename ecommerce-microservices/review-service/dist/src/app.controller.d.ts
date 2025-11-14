import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    create({ dto }: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../schemas/review-schema").Review, {}, {}> & import("../schemas/review-schema").Review & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    findAll({ q }: any): Promise<{
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
    findOne({ id }: any): Promise<{
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
    update({ id, dto }: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../schemas/review-schema").Review, {}, {}> & import("../schemas/review-schema").Review & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    remove({ id }: any, user: any): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
}
