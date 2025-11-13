import { AppService } from './app.service';
export declare class AppController {
    private readonly AppService;
    constructor(AppService: AppService);
    create(data: any, user: any): Promise<import("./dto/user.dto").UserDto>;
    findAll(data: any, user: any): Promise<{
        items: import("./dto/user.dto").UserDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(data: any, user: any): Promise<import("./dto/user.dto").UserDto>;
    update(data: any, user: any): Promise<import("./dto/user.dto").UserDto>;
    deactivate(data: any, user: any): Promise<{
        deactivated: true;
    }>;
}
