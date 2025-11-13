import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product.create')
  create(@Payload() { dto }: any) {
    return this.appService.create(dto);
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
  update(@Payload() { id, dto }: any) {
    return this.appService.update(id, dto);
  }

  @MessagePattern('product.remove')
  remove(@Payload() { id }: any) {
    return this.appService.remove(id);
  }

  @MessagePattern('product.search')
  search(@Payload() { q }: any) {
    return this.appService.search(q);
  }
}
