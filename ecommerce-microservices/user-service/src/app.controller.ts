import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtKafkaAuthGuard, CurrentUser } from '../../libs/auth';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly AppService: AppService) {}

  @UseGuards(JwtKafkaAuthGuard)
  @MessagePattern('user.create')
  async create(@Payload() data: any, @CurrentUser() user: any) {
      if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
    else return this.AppService.create(data.dto);
  }


  @UseGuards(JwtKafkaAuthGuard)
  @MessagePattern('user.findAll')
  async findAll(@Payload() data: any, @CurrentUser() user: any) {
    if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
     else return this.AppService.findAll(data.q);
  }

  @UseGuards(JwtKafkaAuthGuard)
  @MessagePattern('user.findOne')
  async findOne(@Payload() data: any, @CurrentUser() user: any) {
    if(user.role !== 'admin') {
      throw new Error('Access denied: Only admins can access all users.');
    }
    else return this.AppService.findOne(data.id);
  }


  @UseGuards(JwtKafkaAuthGuard)
  @MessagePattern('user.update')
  async update(@Payload() data: any, @CurrentUser() user: any) {
    if(user.sub !== data.id){
      throw new Error('Access denied: You can only update your own profile.');
    }
    else return this.AppService.update(data.id, data.dto);
  }


  @UseGuards(JwtKafkaAuthGuard)
  @MessagePattern('user.deactivate')
  async deactivate(@Payload() data: any, @CurrentUser() user: any) {
    if(user.sub !== data.id){
      throw new Error('Access denied: You can only update your own profile.');
    }
    return this.AppService.deactivate(data.id);
  }
}
