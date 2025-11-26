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
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
  ) {}

async create(data: any) {
  const { orderIds, paymentMethod, total } = data;

  console.log('payment.create payload:', data);

  // Xác định paidAmount theo paymentMethod (áp dụng cho mỗi order)
  let paidAmount = 0;

  if (paymentMethod === 'BANKING') {
    paidAmount = total;
  }

  // Mảng để lưu danh sách payments tạo thành công
  const createdPayments = [];

  // For từng orderId để tạo payment riêng
  for (const orderId of orderIds) {

    const paymentData = {
      orderId,
      paymentMethod,
      total,
      paidAmount,
      status: 'SUCCESS',
    };

    const created = await this.paymentModel.create(paymentData);

    createdPayments.push(created);

    // Emit sự kiện payment.created cho từng orderId
    this.kafka.emit('payment.created', {
      ...paymentData,
      paymentId: created._id.toString(),
    });
  }
  return {
    success: true,
    count: createdPayments.length,
    payments: createdPayments,
  };
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
