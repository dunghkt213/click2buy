import { ClientKafka } from '@nestjs/microservices';
export declare class ReviewGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    create(dto: any, auth?: string): Promise<unknown>;
    findAll(q: any): Promise<unknown>;
    findOne(id: string): Promise<unknown>;
    update(id: string, dto: any, auth?: string): Promise<unknown>;
    remove(id: string, auth?: string): Promise<unknown>;
}
