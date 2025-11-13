import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    create({ dto }: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll({ q }: any): Promise<{
        success: boolean;
        data: any;
    }>;
    findOne({ id }: any): Promise<{
        success: boolean;
        data: any;
    }>;
    update({ id, dto }: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    remove({ id }: any, user: any): Promise<{
        success: boolean;
        message: string;
        deletedId: string;
    }>;
}
