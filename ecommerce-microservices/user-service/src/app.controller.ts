import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { CurrentUser } from './auth/current-user.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly AppService: AppService) {}


  @MessagePattern('user.create')
  @UseGuards(JwtKafkaAuthGuard)
  async create(@Payload() data: any, @CurrentUser() user: any) {
      if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
    else return this.AppService.create(data.dto);
  }



  @MessagePattern('user.findAll')
  @UseGuards(JwtKafkaAuthGuard)
  async findAll(@Payload() data: any, @CurrentUser() user: any) {
    if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
     else return this.AppService.findAll(data.q);
  }

  @MessagePattern('user.findOne')
  @UseGuards(JwtKafkaAuthGuard)
  async findOne(@Payload() data: any, @CurrentUser() user: any) {
    if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
    else return this.AppService.findOne(data.id);
  }



  @MessagePattern('user.update')
  @UseGuards(JwtKafkaAuthGuard)
  async update(@Payload() data: any, @CurrentUser() user: any) {
    if(user.sub !== data.id){
      throw new Error('Access denied: You can only update your own profile.');
    }
    else return this.AppService.update(data.id, data.dto);
  }



  @MessagePattern('user.deactivate')
  @UseGuards(JwtKafkaAuthGuard)
  async deactivate(@Payload() data: any, @CurrentUser() user: any) {
    if(user.sub !== data.id){
      throw new Error('Access denied: You can only update your own profile.');
    }
    return this.AppService.deactivate(data.id);
  }
}
