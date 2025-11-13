import { ClientKafka } from '@nestjs/microservices';
export declare class UserGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    create(dto: any, auth?: string): import("rxjs").Observable<any>;
    findAll(q: any, auth?: string): import("rxjs").Observable<any>;
    findOne(id: string, auth?: string): import("rxjs").Observable<any>;
    update(id: string, dto: any, auth?: string): import("rxjs").Observable<any>;
    deactivate(id: string, auth?: string): import("rxjs").Observable<any>;
}
