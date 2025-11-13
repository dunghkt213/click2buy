import { ClientKafka } from '@nestjs/microservices';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
export declare class AuthGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    login(dto: LoginDto): import("rxjs").Observable<any>;
    register(dto: RegisterDto): import("rxjs").Observable<any>;
}
