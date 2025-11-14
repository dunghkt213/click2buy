import { ClientKafka } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { TokenService } from './token/token.service';
import { registerDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AppService {
    private readonly tokenService;
    private readonly AuthClient;
    constructor(tokenService: TokenService, AuthClient: ClientKafka);
    onModuleInit(): Promise<void>;
    validateUser(dto: LoginDto): Promise<any>;
    generateAccessToken(userRole?: string, userId?: string): Promise<string>;
    generateRefreshToken(userRole?: string, userId?: string): Promise<string>;
    verifyAccessToken(token: string): string | jwt.JwtPayload | null;
    verifyRefreshToken(token: string): Promise<any>;
    login(dto: LoginDto): Promise<{
        user: {
            id: any;
            username: any;
            email: any;
            name: any;
        };
        accessToken: string;
        refreshTokenInfo: {
            name: string;
            value: string;
            options: {
                httpOnly: boolean;
                secure: boolean;
                sameSite: "strict";
                path: string;
                maxAge: number;
            };
        };
    }>;
    registerUser(dto: registerDto): Promise<{
        user: any;
        accessToken: string;
        refreshTokenInfo: {
            name: string;
            value: string;
            options: {
                httpOnly: boolean;
                secure: boolean;
                sameSite: "strict";
                path: string;
                maxAge: number;
            };
        };
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshTokenInfo: {
            name: string;
            value: string;
            options: {
                httpOnly: boolean;
                secure: boolean;
                sameSite: "strict";
                path: string;
                maxAge: number;
            };
        };
    }>;
    revoke(refreshToken: string): Promise<{
        revoked: boolean;
    }>;
}
