// src/payment.controller.ts
import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { PaymentService } from './app.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';

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
  return this.paymentService.createBankingPayments(data.orderIds, data.userId, data.total);
}

}
