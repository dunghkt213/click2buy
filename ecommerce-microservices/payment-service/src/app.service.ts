// src/payment.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { emit } from 'process';
import { ClientKafka } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject('KAFKA_PRODUCER')
    private readonly kafka: ClientKafka,
    private readonly http: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) { }

  async create(data: any) {
    const { orderIds, orderCode, paymentMethod, total, userId } = data;

    console.log('order.created payload:', data);

    if (paymentMethod === 'COD') {
      // giữ nguyên logic cũ
      return this.createCODPayments(orderIds, orderCode, userId, total);
    }

    if (paymentMethod === 'BANKING') {
      return this.createBankingPayments(orderIds, orderCode, userId, total);
    }
  }

  private async createCODPayments(orderIds, orderCode, userId, total) {
    const createdPayments = [];

    for (const orderId of orderIds) {
      const paymentData = {
        userId,
        orderIds: [orderId],
        orderCode,
        paymentMethod: 'COD',
        total,
        paidAmount: 0,
        status: PaymentStatus.PAID,
      };

      const created = await this.paymentModel.create(paymentData);

      createdPayments.push(created);

      this.kafka.emit('payment.success', {
        ...paymentData,
        paymentId: created._id.toString(),
      });
    }

    return {
      success: true,
      payments: createdPayments,
    };
  }

  public async createBankingPayments(orderIds, orderCode, userId, total) {
    const existing = await this.paymentModel.findOne({orderCode});

    if (existing) {
      return {
        success: true,
        payments: existing,
      };
    }

    // Tạo qr mới
    const amount = Math.trunc(total);
    const description = `Order Code: #${orderCode}`;
    const cancelUrl = process.env.PAYOS_CANCEL_URL;
    const returnUrl = process.env.PAYOS_RETURN_URL;
    const payosOrderCode = Math.floor(Number(orderCode) / 1000);

    const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const raw = `amount=${amount}&cancelUrl=${cancelUrl ?? ''}&description=${description}&orderCode=${payosOrderCode}&returnUrl=${returnUrl ?? ''}`;

    console.log("🔍 SIGN RAW:", raw);

    const signature = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
      .update(raw)
      .digest('hex');

    const payload = {
      orderCode: payosOrderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
      expiredAt,
      signature,
    };
    console.log("👉 PayOS payload:", payload);


    const { data } = await this.http.axiosRef.post(
      'https://api-merchant.payos.vn/v2/payment-requests',
      payload,
      {
        headers: {
          'x-client-id': process.env.PAYOS_CLIENT_ID,
          'x-api-key': process.env.PAYOS_API_KEY,
          // nếu có partner-code thì thêm:
          // 'x-partner-code': process.env.PAYOS_PARTNER_CODE,
        },
      },
    );

    if (data.code !== '00' || !data.data) {
      // ✅ tạo 1 record FAILED đúng nghĩa (đừng updateOne theo orderCode nếu chưa có record)
      const failed = await this.paymentModel.create({
        orderIds,
        userId,
        orderCode,
        paymentMethod: 'BANKING',
        total,
        paidAmount: 0,
        status: PaymentStatus.FAILED,
        failReason: data.desc,
      });

      this.kafka.emit('payment.failed', { userId, orderCode, reason: data.desc });
      return {
        success: false,
        code: data.code,
        message: data.desc,
        payments: failed,
      };
    }

      // data dạng:
      // { code, desc, data: { checkoutUrl, qrCode, ... }, signature }
      const d = data.data;

      const created = await this.paymentModel.create({
        orderIds,
        userId,
        orderCode,                  // 🔴 nên thêm field này vào schema Payment
        paymentMethod: 'BANKING',
        total,
        paidAmount: 0,
        status: 'PENDING',
        qrCode: d.qrCode,
        checkoutUrl: d.checkoutUrl,
        paymentLinkId: d.paymentLinkId,
        expireAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      await this.redis.set(
        `payment:expire:${created._id}`,
        created._id.toString(),
        'EX',
        900
      );

      this.kafka.emit('payment.qr.created', {
        userId,
        orderCode,
        qrCode: created.qrCode,
        checkoutUrl: created.checkoutUrl,
        expireIn: 900,
      });

      return {
        success: true,
        payments: created,
      };
    }

  async handlePayOSCallback(payload: any) {
      console.log("🔔 PayOS Callback received:", payload);

      // unwrap nested structure
      const payos = payload.body;
      const data = payos.data;
      const signature = payos.signature;

      if (!data) {
        console.log("❌ Missing data field in callback");
        return { error: true };
      }

      const payment = await this.paymentModel.findOne({ paymentLinkId: data.paymentLinkId });
      if (!payment) {
        console.log("❌ No payment match with paymentLinkId");
        return { error: true };
      }

      if (data.code !== '00') {
        await payment.updateOne({ status: 'FAILED' });

        this.kafka.emit('payment.failed', { userId:payment.userId ,  orderCode: payment.orderCode, reason: data.desc });

        return { failed: true };
      }

      // idempotent
      if (payment.status === PaymentStatus.PAID) return { ok: true };

      await payment.updateOne({
        status: PaymentStatus.PAID,
        paidAmount: data.amount,
      });

      // emit success
      this.kafka.emit('payment.success', {
        userId: payment.userId,
        orderIds: payment.orderIds,
        paymentMethod: 'BANKING',
        total: payment.total,
        paidAmount: data.amount,
        status: PaymentStatus.PAID,
        paymentId: payment._id.toString(),
      });

      console.log("🎉 Payment stored & emitted:", payment._id.toString());

      return { received: true };
    }

  async getByOrderCode(orderCode: string, userId: string) {
      const payment = await this.paymentModel.findOne({
        orderCode,
        userId
      });

      if (!payment) return { exists: false };

      return {
        exists: true,
        status: payment.status,          // ✅ thêm status cho FE
        orderCode: payment.orderCode,
        qrCode: payment.qrCode ?? null,  // ✅ paid/expired có thể null
        checkoutUrl: payment.checkoutUrl ?? null,
        expiredAt: payment.expireAt ?? null,
        expireIn:
          payment.expireAt
            ? Math.max(0, Math.floor((payment.expireAt.getTime() - Date.now()) / 1000))
            : 0,
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

   async handlePaymentTimeout(paymentId: string) {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment) return;
    
      // nếu đã PAID thì bỏ qua
      if (payment.status === PaymentStatus.PAID) return;
    
      // ❌ FAIL + cleanup
      await payment.updateOne({ status: PaymentStatus.FAILED });
    
      this.kafka.emit('payment.failed', {
        userId: payment.userId,
        orderCode: payment.orderCode,
        reason: 'PAYMENT_TIMEOUT',
      });
    
      console.log(`⏰ Payment timeout → deleted: ${paymentId}`);
    }
    

  }

