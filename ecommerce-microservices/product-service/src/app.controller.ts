import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CurrentUser } from './auth/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';
import { JwtService } from './auth/jwt.service';
import { UserPayload } from './auth/jwt-payload.interface';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) { }

  @MessagePattern('product.create')
  @UseGuards(JwtKafkaAuthGuard)
  create(@Payload() { dto }: any, @CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    if (user.role == 'seller') {
      return this.appService.create(dto, userId);
    } else {
      return { success: false, message: 'Only sellers can create products' };
    }
  }

  @MessagePattern('product.findAll')
  async findAll(@Payload() { q, auth }: any) {
    let user: UserPayload | null = null;

    if (auth) {
      try {
        const token = auth.split(' ')[1];
        user = this.jwtService.validateToken(token);
        console.log("DECODED USER:", user);
      } catch { }
    }

    if (user?.role === 'seller') {
      return this.appService.findAllOfSeller(q, user.sub || user.id);
    }

    return this.appService.findAll(q);
  }

  @MessagePattern('product.findOne')
  async findOne(@Payload() { id, auth }: any) {
    let user: UserPayload | null = null;

    if (auth) {
      try {
        const token = auth.split(' ')[1];
        user = this.jwtService.validateToken(token);
        console.log("DECODED USER:", user.sub || user.id);
      } catch (e) {
        user = null;  // Cho phép public access nếu token invalid
      }
    }

    if (user?.role === 'seller') {
      return this.appService.findOneOfSeller(id, user.sub || user.id);
    }

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
}
