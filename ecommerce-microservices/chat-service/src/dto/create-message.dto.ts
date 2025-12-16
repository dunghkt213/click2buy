import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho việc tạo tin nhắn mới
 */
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

/**
 * DTO cho việc tìm/tạo conversation
 */
export class FindOrCreateConversationDto {
  @IsString()
  @IsNotEmpty()
  userId1: string;

  @IsString()
  @IsNotEmpty()
  userId2: string;
}

/**
 * DTO cho việc lấy messages theo conversation
 */
export class FindMessagesByConversationDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  skip?: number;
}

/**
 * DTO cho việc đánh dấu đã đọc
 */
export class MarkAsReadDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
