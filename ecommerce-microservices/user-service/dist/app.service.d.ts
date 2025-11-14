import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserDto } from './dto/user.dto';
export declare class AppService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    private toUserDto;
    create(dto: CreateUserDto): Promise<UserDto>;
    findAll(q: QueryUserDto): Promise<{
        items: UserDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<UserDto>;
    update(id: string, dto: UpdateUserDto): Promise<UserDto>;
    findByforpasswordHash(value: string): Promise<(import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }) | null>;
    findBy(field: 'username' | 'email' | '_id', value: string): Promise<import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
    deactivate(id: string): Promise<{
        deactivated: true;
    }>;
    hardDelete(id: string): Promise<{
        deleted: true;
    }>;
    findByEmail(email: string): Promise<UserDto | null>;
    findWithPassword(email: string): Promise<(import("mongoose").FlattenMaps<UserDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }) | null>;
}
