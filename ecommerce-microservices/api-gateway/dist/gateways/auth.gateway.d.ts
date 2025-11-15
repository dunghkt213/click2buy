import { ClientKafka } from '@nestjs/microservices';
import { LoginDto } from 'src/dtos/login.dto';
import { RegisterDto } from 'src/dtos/register.dto';
import type { Response, Request } from 'express';
export declare class AuthGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: any;
        accessToken: any;
    }>;
    register(dto: RegisterDto, res: Response): Promise<{
        message: string;
        user: any;
        accessToken: any;
    }>;
    refresh(req: Request, res: Response): Promise<{
        message: string;
        accessToken: any;
    }>;
    logout(req: Request, res: Response): Promise<{
        success: boolean;
        message: any;
    }>;
}
