import { ClientKafka } from '@nestjs/microservices';
export declare function handleKafkaRequest<T = any>(kafka: ClientKafka, topic: string, payload: any): Promise<T>;
