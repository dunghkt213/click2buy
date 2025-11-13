import { UserRole } from '../schemas/user.schema';
export declare class QueryUserDto {
    search?: string;
    role?: UserRole;
    isActive?: string;
    page?: string;
    limit?: string;
    sort?: string;
}
