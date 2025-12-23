import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId!: string; 

  @IsString()
  @IsNotEmpty()
  title!: string;


  @IsString()
  @IsNotEmpty()
  type!: string; // ORDER | CHAT | SYSTEM...
  
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class FindByUserDto {
  @IsString()
  userId!: string;
}

export class MarkAsReadDto {
  @IsString()
  notificationId!: string;

  @IsString()
  userId!: string;
}
