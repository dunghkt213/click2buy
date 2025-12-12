import { Controller, Inject } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CurrentUser } from './auth/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
  @Inject('KAFKA_SERVICE') private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('product.batch');

    await this.kafka.connect();
  }

  @MessagePattern('product.create')
  @UseGuards(JwtKafkaAuthGuard)
  create(@Payload() { dto }: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    console.log('Current User in Product Service:', user);
    if (user.role == 'seller') {
    return this.appService.create(dto, userId);
    } else {
      return { success: false, message: 'Only sellers can create products' };
    }
  }

  @MessagePattern('product.findAll')
  findAll(@Payload() { q }: any) {
    return this.appService.findAll(q);
  }

  @MessagePattern('product.findOne')
  findOne(@Payload() { id }: any) {
    return this.appService.findOne(id);
  }

  @MessagePattern('product.update')
  @UseGuards(JwtKafkaAuthGuard)
  update(@Payload() { id, dto }: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.appService.update(id, dto, userId);
  }

  @MessagePattern('product.remove')
  @UseGuards(JwtKafkaAuthGuard)
  remove(@Payload() { id }: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.appService.remove({ id, userId });
  }

  @MessagePattern('product.search')
  search(@Payload() { q }: any) {
    return this.appService.search(q);
  }


  @MessagePattern('product.batch')
  async getBatch(@Payload() data: { ids: string[] }) {
    console.log('Received batch request for IDs:', data.ids);
    return this.appService.findBatch(data.ids);
  }

}
