import { ClientKafka } from '@nestjs/microservices';
export declare class ReviewGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    create(dto: any, auth?: string): import("rxjs").Observable<any>;
    findAll(q: any): import("rxjs").Observable<any>;
    findOne(id: string): import("rxjs").Observable<any>;
    update(id: string, dto: any, auth?: string): import("rxjs").Observable<any>;
    remove(id: string, auth?: string): import("rxjs").Observable<any>;
}
