import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CurrentUser } from './auth/current-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product.create')
  //@UseGuards(JwtKafkaAuthGuard)
  create(@Payload() { dto }: any, @CurrentUser() user: any) {
    //const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.create(dto, userId);
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
  //@UseGuards(JwtKafkaAuthGuard)
  update(@Payload() { id, dto }: any, @CurrentUser() user: any) {
    //const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.update(id, dto, userId);
  }

  @MessagePattern('product.remove')
  //@UseGuards(JwtKafkaAuthGuard)
  remove(@Payload() { id }: any, @CurrentUser() user: any) {
    //const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.remove({ id, userId });
  }

  @MessagePattern('product.search')
  search(@Payload() { q }: any) {
    return this.appService.search(q);
  }
}
