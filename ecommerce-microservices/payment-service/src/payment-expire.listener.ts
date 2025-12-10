import { Injectable, Logger, Inject } from '@nestjs/common';
import  Redis  from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';

@Injectable()
export class PaymentExpireListener {
  private readonly logger = new Logger(PaymentExpireListener.name);

  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly sub: Redis,
    @InjectModel(Payment.name) private paymentModel: Model<any>,
  ) {
    this.sub.psubscribe('__keyevent@0__:expired', (err) => {
      if (!err) this.logger.log('👂 Start listening payment expiration...');
    });

    this.sub.on('pmessage', async (_, __, key) => {
      if (!key.startsWith('payment:expire:')) return;

      const paymentId = key.split(':')[2];
      this.logger.warn(`⚠️ QR expired -> updating payment ${paymentId}`);

      await this.paymentModel.findByIdAndUpdate(paymentId, {
        status: 'EXPIRED',
      });

      this.logger.log(`💀 Payment ${paymentId} set to EXPIRED`);
    });
  }
}
