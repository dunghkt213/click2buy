import { ClientKafka } from '@nestjs/microservices';
export declare class CartGateway {
    private readonly kafka;
    constructor(kafka: ClientKafka);
    onModuleInit(): Promise<void>;
    getCart(auth?: string): import("rxjs").Observable<any>;
    addItem(dto: any, auth?: string): import("rxjs").Observable<any>;
    updateItem(productId: string, dto: any, auth?: string): import("rxjs").Observable<any>;
    removeItem(productId: string, auth?: string): import("rxjs").Observable<any>;
    clear(auth?: string): import("rxjs").Observable<any>;
}
