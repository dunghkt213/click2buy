import { Injectable } from '@nestjs/common';

interface OtpRecord {
  otp: string;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  // In-memory store (trong production nên dùng Redis)
  private otpStore: Map<string, OtpRecord> = new Map();

  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async saveOtp(phone: string, otp: string): Promise<void> {
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);
    this.otpStore.set(phone, { otp, expiresAt, attempts: 0 });
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const record = this.otpStore.get(phone);

    if (!record) {
      return false;
    }

    if (new Date() > record.expiresAt) {
      this.otpStore.delete(phone);
      return false;
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(phone);
      return false;
    }

    if (record.otp !== otp) {
      record.attempts++;
      return false;
    }

    // OTP valid - xóa khỏi store
    this.otpStore.delete(phone);
    return true;
  }

  async sendSms(phone: string, otp: string): Promise<boolean> {
    // Mock SMS sending - trong production dùng Twilio hoặc service khác
    console.log(`📱 [MOCK SMS] Sending OTP ${otp} to ${phone}`);
    
    // Nếu muốn dùng Twilio thật:
    // const twilioClient = require('twilio')(
    //   process.env.TWILIO_ACCOUNT_SID,
    //   process.env.TWILIO_AUTH_TOKEN
    // );
    // await twilioClient.messages.create({
    //   body: `Your Click2Buy OTP is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });

    return true;
  }
}
