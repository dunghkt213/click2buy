// src/app.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
  ) {}

  async onProductCreated(data: any) {
    this.logger.log('product.created received', data);
    return true;
  }

  async reserveStock(data: any) {
    this.logger.log('reserve stock', data);
    return true;
  }

  async confirmStock(data: any) {
    this.logger.log('confirm stock', data);
    return true;
  }

  async releaseStock(data: any) {
    this.logger.log('release stock', data);
    return true;
  }

  emitInventoryEvent(event: string, payload: any) {
    this.kafka.emit(event, payload);
    this.logger.log(`emitted ${event}`, payload);
  }
}
