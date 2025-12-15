// src/payment.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
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
    const { orderIds, paymentMethod, total, userId } = data;

    console.log('order.created payload:', data);

    if (paymentMethod === 'COD') {
      // giữ nguyên logic cũ
      return this.createCODPayments(orderIds, userId, total);
    }

    if (paymentMethod === 'BANKING') {
      return this.createBankingPayments(orderIds, userId, total);
    }
  }


  private async createCODPayments(orderIds, userId, total) {
    const createdPayments = [];

    for (const orderId of orderIds) {
      const paymentData = {
        userId,
        orderId,
        paymentMethod: 'COD',
        total,
        paidAmount: 0,
        status: 'SUCCESS',
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

  public async createBankingPayments(orderIds, userId, total) {
    const createdPayments = [];

    for (const orderId of orderIds) {
      const existing = await this.paymentModel.findOne({
        orderId,
        status: 'PENDING',
      });

      if (existing) {
        console.log("⚠️ Duplicate pay request -> reusing old QR instead of creating new");
  
        // phát QR cũ lại cho FE
        this.kafka.emit('payment.qr.created', {
          userId,
          payments: [{
            orderId,
            checkoutUrl: existing.checkoutUrl,
            qrCode: existing.qrCode,
            expireIn: 900,
          }],
        });
  
        createdPayments.push(existing);
        continue; // 🚨 không chạy xuống PayOS nữa
      }


      const amount = Math.trunc(total);
      const orderCode = Date.now();

      const shortOrderId = orderId.substring(0, 6);
      const description = `TT DH #${shortOrderId}`;
      const cancelUrl = process.env.PAYOS_CANCEL_URL;
      const returnUrl = process.env.PAYOS_RETURN_URL;

      console.log("🔍 ENV:", {
        cancelUrl,
        returnUrl,
        key: process.env.PAYOS_CHECKSUM_KEY,
      });
      
      const expiredAt = Math.floor(Date.now() / 1000) + 15 * 60;
      const raw = `amount=${amount}&cancelUrl=${cancelUrl ?? ''}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl ?? ''}`;

      console.log("🔍 SIGN RAW:", raw);

      const signature = crypto
        .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
        .update(raw)
        .digest('hex');

      const payload = {
        orderCode,
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
      
      console.log('👉 PayOS response:', data);
      if (data.code !== '00' || !data.data) {
        throw new Error(
          `PayOS rejected: code=${data.code}, desc=${data.desc}`
        );
      }

      // data dạng:
      // { code, desc, data: { checkoutUrl, qrCode, ... }, signature }
      const d = data.data;

      const created = await this.paymentModel.create({
        orderId,
        userId,
        orderCode,                  // 🔴 nên thêm field này vào schema Payment
        paymentMethod: 'BANKING',
        total,
        paidAmount: 0,
        status: 'PENDING',
        qrCode: d.qrCode,
        checkoutUrl: d.checkoutUrl,
        paymentLinkId: d.paymentLinkId,
        expireAt: Date.now() + 15 * 60 * 1000,
      });
      
      await this.redis.set(
        `payment:expire:${created._id}`,
        created._id.toString(),
        'EX',
        900
      );

      createdPayments.push(created);
    }
    console.log("✅ Created BANKING payments:", createdPayments);

    this.kafka.emit('payment.qr.created', {
      userId,
      payments: createdPayments.map((p) => ({
        orderId: p.orderId,
        checkoutUrl: p.checkoutUrl,
        qrCode: p.qrCode,
        expireIn: 900,
      })),
    });

    return {
      success: true,
      payments: createdPayments,
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
  
    // prepare signature verify
    const raw = JSON.stringify(data);
    const verify = crypto
      .createHmac("sha256", process.env.PAYOS_API_KEY)
      .update(raw)
      .digest("hex");

    const payment = await this.paymentModel.findOne({ paymentLinkId: data.paymentLinkId });
    if (!payment) {
      console.log("❌ No payment match with paymentLinkId");
      return { error: true };}
  
    if (data.code !== '00') {
      await payment.updateOne({ status: 'FAILED' });
      return { failed: true };
    }
  
    // idempotent
    if (payment.status === 'SUCCESS') return { ok: true };
  
    await payment.updateOne({
      status: 'SUCCESS',
      paidAmount: data.amount,
    });
  
    // emit success
    this.kafka.emit('payment.success', {
      userId: payment.userId,
      orderId: payment.orderId,
      paymentMethod: 'BANKING',
      total: payment.total,
      paidAmount: data.amount,
      status: 'SUCCESS',
      paymentId: payment._id.toString(),
    });
  
    console.log("🎉 Payment stored & emitted:", payment._id.toString());
  
    return { received: true };
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

