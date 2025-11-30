import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { CurrentUser } from './auth/current-user.decorator';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly AppService: AppService) {}


  @MessagePattern('user.create')
  async create(@Payload() data: CreateUserDto) {
  try {
    const result = await this.AppService.create(data);
    return result;
  } catch (err) {
    // Tạo format lỗi gửi về Gateway
    throw new RpcException({
      success: false,
      message: err.message || 'User creation failed',
      code: 'USER_CREATE_ERROR',
    });
  }
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
  async findOne(@Payload() data: any) {
    return this.AppService.findOne(data.id);
  }

  @MessagePattern('user.getByCondition')
  async findByCondition(@Payload() data: any) {
    try {
      return await this.AppService.findBy(data.field, data.value);
    } catch (err) {
      throw new RpcException({
        success: false,
        message: err.message || 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
  }

  @MessagePattern('user.getByforpasswordHash')
  async findByforpasswordHash(@Payload() data: any) {
    try {
      return await this.AppService.findByforpasswordHash(data.username);
    } catch (err) {
      throw new RpcException({
        success: false,
        message: err.message || 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
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

  // ==================== SOCIAL LOGIN ====================

  @MessagePattern('user.findOrCreateSocial')
  async findOrCreateSocial(@Payload() data: {
    provider: 'google' | 'facebook';
    socialId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) {
    try {
      return await this.AppService.findOrCreateSocial(data);
    } catch (err) {
      throw new RpcException({
        success: false,
        message: err.message || 'Social login failed',
        code: 'SOCIAL_LOGIN_ERROR',
      });
    }
  }

  // ==================== PHONE LOGIN ====================

  @MessagePattern('user.findOrCreateByPhone')
  async findOrCreateByPhone(@Payload() data: { phone: string }) {
    try {
      return await this.AppService.findOrCreateByPhone(data);
    } catch (err) {
      throw new RpcException({
        success: false,
        message: err.message || 'Phone login failed',
        code: 'PHONE_LOGIN_ERROR',
      });
    }
  }
}
