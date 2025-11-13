import { ClientKafka } from '@nestjs/microservices';
export declare class ReviewGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    create(dto: any, auth?: string): Promise<any>;
    findAll(q: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: any, auth?: string): Promise<any>;
    remove(id: string, auth?: string): Promise<any>;
}
