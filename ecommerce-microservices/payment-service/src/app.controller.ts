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

  @MessagePattern('inventory.reserved')
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @MessagePattern('payment.findAll')
  findAll(@Query() query: QueryPaymentDto) {
    return this.paymentService.findAll(query);
  }
  
}
