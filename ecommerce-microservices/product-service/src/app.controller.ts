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

  @MessagePattern("review.created")
async handleReviewCreated(@Payload() payload: { productId: string; rating: number }) {
  return this.appService.updateRatingStats(payload);
}


  @MessagePattern('product.findAll')
  findAll(@Payload() { q }: any) {
    return this.appService.findAll(q);
  }

  @MessagePattern('product.findOne')
  findOne(@Payload() { id }: any) {
    return this.appService.findOne(id);
  }

  // SELLER PROTECTED
  @MessagePattern('product.seller.findAll')
  @UseGuards(JwtKafkaAuthGuard)
  findAllOfSeller(@Payload() { q }: any, @CurrentUser() user: any) {
    const sellerId = user?.sub || user?.id;
    return this.appService.findAllOfSeller(q, sellerId);
  }

  @MessagePattern('product.seller.findOne')
  @UseGuards(JwtKafkaAuthGuard)
  findOneOfSeller(@Payload() { id }: any, @CurrentUser() user: any) {
    const sellerId = user?.sub || user?.id;
    return this.appService.findOneOfSeller(id, sellerId);
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

  @MessagePattern('product.updateReviewSummary')
  updateReviewSummary(@Payload() { productId, reviewSummary }: { productId: string; reviewSummary: string }) {
    return this.appService.updateReviewSummary(productId, reviewSummary);
  }

  @MessagePattern('product.findBySeller')
  findBySeller(@Payload() { sellerId, limit }: { sellerId: string; limit?: number }) {
    return this.appService.findBySeller(sellerId, limit);
  }
}
