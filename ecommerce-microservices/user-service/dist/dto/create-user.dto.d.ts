import { UserRole } from '../schemas/user.schema';
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    avatar?: string;
}
