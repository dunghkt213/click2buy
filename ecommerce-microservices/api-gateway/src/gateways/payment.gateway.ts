import { Body, Controller, Post, Headers, Inject, Get, Param } from '@nestjs/common';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';
import { PaymentWsGateway } from './payment-ws.gateway';

@Controller('payment')
export class PaymentGateway {
  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafka: ClientKafka,
    private readonly paymentWs: PaymentWsGateway,
  ) { }

  async onModuleInit() {
    this.kafka.subscribeToResponseOf('payment.success');
    this.kafka.subscribeToResponseOf('payment.qr.created');
    this.kafka.subscribeToResponseOf('payment.qr.expired');
    this.kafka.subscribeToResponseOf('payment.get.by.order');
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

    this.paymentWs.sendToUser(payload.userId, {
      type: 'QR_CREATED',
      data: payload,
    });
  }

  // 📌 Lắng nghe event thanh toán thành công → realtime FE
  @MessagePattern('payment.success')
  handlePaymentSuccess(payload: any) {
    console.log('📡 EVENT payment.success RECEIVED', payload);

    this.paymentWs.sendToUser(payload.userId, {
      type: 'PAYMENT_SUCCESS',
      data: payload,
    });
  }
  
  @MessagePattern('payment.qr.expired')
  sendExpireToUser(msg) {
    this.paymentWs.sendToUser(msg.userId, {
      type: 'QR_EXPIRED',
      orderId: msg.orderId
    });
  }

  @Get('/by-order/:orderCode')
  getPaymentByOrder(
    @Param('orderCode') orderCode: string,
    @Headers('authorization') auth: string,
  ) {
    return this.kafka.send(
      'payment.get.by.order',
      { orderCode, auth }
    );
  }

}
