import { AppService } from './app.service';
import { registerDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    handleRegister(data: registerDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    handleLogin(message: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: any;
        data?: undefined;
    }>;
    handleLogout(message: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleRefresh(message: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
        data?: undefined;
    }>;
    handleVerify(message: {
        token: string;
    }): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            user: {
                id: string | (() => string) | undefined;
                username: any;
            };
        };
        error?: undefined;
    }>;
    handleRevoke(message: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
