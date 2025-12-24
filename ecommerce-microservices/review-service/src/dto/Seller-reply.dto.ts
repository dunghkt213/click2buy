import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SellerReplyDto {
  @IsBoolean()
  @IsOptional()
  replyBySeller?: string;
}
