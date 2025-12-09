import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @MessagePattern('review.create')
  //@UseGuards(JwtKafkaAuthGuard)
  create(@Payload() { dto }: any, @CurrentUser() user: any) {
    // const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.create( dto, userId);
  }

  @MessagePattern('review.findAll')
  findAll(@Payload() { q }: any) {
    return this.appService.findAll(q);
  }

  @MessagePattern('review.findOne')
  findOne(@Payload() { id }: any) {
    return this.appService.findOne(id);
  }

  @MessagePattern('review.update')
  //@UseGuards(JwtKafkaAuthGuard)
  update(@Payload() { id, dto }: any, @CurrentUser() user: any) {
    //const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.update(id, dto, userId);
  }

  @MessagePattern('review.delete')
  //@UseGuards(JwtKafkaAuthGuard)
  remove(@Payload() { id }: any, @CurrentUser() user: any) {
    //const userId = user?.sub || user?.id;
    const userId = 'mock-user';
    return this.appService.remove({ id, userId});
  }
}