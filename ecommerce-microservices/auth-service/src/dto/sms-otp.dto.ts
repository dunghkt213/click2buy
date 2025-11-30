export class SendOtpDto {
  phone: string;
}

export class VerifyOtpDto {
  phone: string;
  otp: string;
}
