// src/payment.controller.ts
import { Body, Controller, Get, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './app.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { CurrentUser } from './auth/current-user.decorator';
import { JwtKafkaAuthGuard } from './auth/jwt-kafka.guard';

@Controller()
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @MessagePattern('order.created')
  create(dto: any) {
    console.log('=>> controller payment.order.created', dto)
    return this.paymentService.create(dto);
  }

  @MessagePattern('payment.findAll')
  findAll(@Query() query: any) {
    return this.paymentService.findAll(query);
  }

  @MessagePattern('payment.payos.callback')
  handlePayOSCallback(body) {
   return this.paymentService.handlePayOSCallback(body);
}

@MessagePattern('payment.banking.requested')
async handleBankingRequested(data: any) {
  console.log('📥 payment.banking.requested RECEIVED', data);
  return this.paymentService.createBankingPayments(data.orderIds, data.orderCode, data.userId, data.total);
}

@MessagePattern('payment.get.by.order')
@UseGuards(JwtKafkaAuthGuard)
async getByOrder(
  @Payload() data,
  @CurrentUser() user,
) {
  console.log('📥 payment.get.by.order RECEIVED', data, 'user:', user);
  return this.paymentService.getByOrderCode(
    data.orderCode,
    user.sub,
  );
}


}
