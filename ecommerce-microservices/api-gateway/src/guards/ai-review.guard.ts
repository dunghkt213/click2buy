import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AiService } from '../modules/ai-guard/ai.service';

@Injectable()
export class AiReviewGuard implements CanActivate {
  private readonly logger = new Logger(AiReviewGuard.name);

  constructor(private readonly aiService: AiService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { content, comment, review, text } = request.body || {};

    // Lấy nội dung review từ các field phổ biến
    const reviewContent = content || comment || review || text;

    // Nếu không có nội dung, cho qua (validation khác sẽ xử lý)
    if (!reviewContent || typeof reviewContent !== 'string') {
      this.logger.debug('Không tìm thấy nội dung review trong request body');
      return true;
    }

    try {
      const isValid = await this.aiService.validateContent(reviewContent, 'REVIEW');

      if (!isValid) {
        this.logger.warn(`Review bị chặn: "${reviewContent.substring(0, 100)}..."`);
        throw new BadRequestException(
          'Nội dung đánh giá vi phạm tiêu chuẩn cộng đồng. Vui lòng kiểm tra lại nội dung của bạn.',
        );
      }

      return true;
    } catch (error) {
      // Nếu là BadRequestException từ validation, ném lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Nếu là lỗi khác (AI không phản hồi), cho qua để không chặn user oan
      this.logger.error(`AI Guard error: ${error.message}`);
      return true;
    }
  }
}
