import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    CUSTOMER = "customer",
    ADMIN = "admin"
}
export declare class Address {
    line1: string;
    line2?: string;
    wardOrDistrict: string;
    city: string;
    province?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
}
export declare class User {
    username: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    address: Address[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
