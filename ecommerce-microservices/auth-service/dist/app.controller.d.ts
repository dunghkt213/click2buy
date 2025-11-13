import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './app.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    handleRegister(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: unknown;
            email: string;
            username: string;
        };
    }>;
    handleLogin(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: unknown;
            email: string;
            username: string;
        };
    }>;
}
