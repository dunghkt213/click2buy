import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class AppController {
    private readonly AppService;
    constructor(AppService: AppService);
    create(data: CreateUserDto): Promise<import("./dto/user.dto").UserDto>;
    findAll(data: any, user: any): Promise<{
        items: import("./dto/user.dto").UserDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(data: any): Promise<import("./dto/user.dto").UserDto>;
    findByCondition(data: any): Promise<import("mongoose").FlattenMaps<import("./schemas/user.schema").UserDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    findByforpasswordHash(data: any): Promise<(import("mongoose").FlattenMaps<import("./schemas/user.schema").UserDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }) | null>;
    update(data: any, user: any): Promise<import("./dto/user.dto").UserDto>;
    deactivate(data: any, user: any): Promise<{
        deactivated: true;
    }>;
}
