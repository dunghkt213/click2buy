// src/payment.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { emit } from 'process';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject('PAYMENT_SERVICE')
    private readonly kafka: ClientKafka,
  ) {}

  async create(data: CreatePaymentDto) {
    let paidAmount = 0;

    if(data.paymentMethod === 'COD') {
      paidAmount = 0;
    } else if(data.paymentMethod === 'BANKING') {
      paidAmount = data.total;
      console.log(' Method BANKING dang trong qua trinh phat trien:');
    }
    this.kafka.emit('payment.success', {...data, paidAmount});
    return this.paymentModel.create({
      ...data,
      paidAmount,
      status: 'SUCCESS',
    });
  }
  
  async update(id: string, data: UpdatePaymentDto) {
    return this.paymentModel.findByIdAndUpdate(id, data, { new: true });
  }

  async findAll(query: any) {
    const { page = 0, size = 10, ...filters } = query;
    const items = await this.paymentModel
      .find(filters)
      .skip(page * size)
      .limit(size);

    const total = await this.paymentModel.countDocuments(filters);
    return { items, total };
  }
}
