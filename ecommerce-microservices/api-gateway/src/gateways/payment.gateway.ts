import { Body, Controller, Post, Headers, Inject } from '@nestjs/common';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';
import { SseService } from './sse/sse.service';

@Controller('payment')
export class PaymentGateway {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
    private readonly sseService: SseService
  ) {}

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('payment.success');
    this.kafka.subscribeToResponseOf('payment.qr.created');
    this.kafka.subscribeToResponseOf('payment.qr.expired');
    await this.kafka.connect();
  }

  @Post('/payos/callback')
  handlePayOS(
    @Body() body: any,
    @Headers('x-signature') signature: string,
  ) {
    console.log('📥 PAYOS CALLBACK GATEWAY RECEIVED');
    console.log('body:', body);

    this.kafka.emit('payment.payos.callback', {
      body,
      signature,
    });

    return { received: true };
  }

  // 📌 Lắng nghe event QR tạo xong → gửi realtime cho FE
  @MessagePattern('payment.qr.created')
  handleQrCreated(payload: any) {
    console.log('📡 EVENT payment.qr.created RECEIVED', payload);

    this.sseService.pushToUser(payload.userId, {
      type: 'QR_CREATED',
      data: payload.payments,
    });
  }

  // 📌 Lắng nghe event thanh toán thành công → realtime FE
  @MessagePattern('payment.success')
  handlePaymentSuccess(payload: any) {
    console.log('📡 EVENT payment.success RECEIVED', payload);

    this.sseService.pushToUser(payload.userId, {
      type: 'PAYMENT_SUCCESS',
      data: payload,
    });
  }

  @Post('/create-banking')
  async requestBanking(@Body() body: any, @Headers('authorization') auth?: string) {
    this.kafka.emit('order.payment.banking.requested', {
      ...body,
      auth,
    });
  
    return { message: 'Banking payment requested, waiting for QR' };
  }

  @MessagePattern('payment.qr.expired')
  sendExpireToUser(msg) {
  this.sseService.pushToUser(msg.userId, {
    type: 'QR_EXPIRED',
    orderId: msg.orderId
  });
}



}
