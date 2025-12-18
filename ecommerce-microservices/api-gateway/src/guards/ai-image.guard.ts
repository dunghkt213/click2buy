import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AiService, ImageType } from '../modules/ai-guard/ai.service';
import { AI_IMAGE_TYPE_KEY } from '../decorators/ai-image-type.decorator';

@Injectable()
export class AiImageGuard implements CanActivate {
  private readonly logger = new Logger(AiImageGuard.name);

  constructor(
    private readonly aiService: AiService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body || {};

    // Lấy loại ảnh từ metadata (decorator) hoặc mặc định
    const imageType: ImageType = this.reflector.get<ImageType>(
      AI_IMAGE_TYPE_KEY,
      context.getHandler(),
    ) || 'PRODUCT_IMAGE';

    // Lấy danh sách ảnh từ các field phổ biến
    const images = this.extractImages(body);

    // Nếu không có ảnh, cho qua
    if (images.length === 0) {
      this.logger.debug('[AI Image Guard] Không tìm thấy ảnh trong request');
      return true;
    }

    this.logger.log(`[AI Image Guard] Kiểm duyệt ${images.length} ảnh (${imageType})`);

    try {
      const result = await this.aiService.validateImages(images, imageType);

      if (!result.valid) {
        const violatedIndex = result.violatedIndex ?? 0;
        this.logger.warn(
          `[AI Image Guard] Ảnh #${violatedIndex + 1} vi phạm chính sách (${imageType})`,
        );

        const message = imageType === 'PRODUCT_IMAGE'
          ? `Ảnh sản phẩm #${violatedIndex + 1} vi phạm chính sách nội dung. Vui lòng sử dụng ảnh khác.`
          : `Ảnh đánh giá #${violatedIndex + 1} vi phạm chính sách nội dung. Vui lòng sử dụng ảnh khác.`;

        throw new BadRequestException(message);
      }

      this.logger.log(`[AI Image Guard] Tất cả ${images.length} ảnh hợp lệ`);
      return true;
    } catch (error) {
      // Nếu là BadRequestException từ validation, ném lại
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Fail-safe: Nếu là lỗi khác (AI không phản hồi), cho qua
      this.logger.error(`[AI Image Guard] Lỗi: ${error.message}`);
      return true;
    }
  }

  /**
   * Trích xuất danh sách ảnh từ request body
   */
  private extractImages(body: any): string[] {
    const images: string[] = [];

    // Field 'images' (array)
    if (Array.isArray(body.images)) {
      images.push(...body.images.filter((img: any) => typeof img === 'string'));
    }

    // Field 'image' (single)
    if (typeof body.image === 'string') {
      images.push(body.image);
    }

    // Field 'imageUrl' (single)
    if (typeof body.imageUrl === 'string') {
      images.push(body.imageUrl);
    }

    // Field 'imageUrls' (array)
    if (Array.isArray(body.imageUrls)) {
      images.push(...body.imageUrls.filter((img: any) => typeof img === 'string'));
    }

    // Field 'photos' (array)
    if (Array.isArray(body.photos)) {
      images.push(...body.photos.filter((img: any) => typeof img === 'string'));
    }

    // Field 'photo' (single)
    if (typeof body.photo === 'string') {
      images.push(body.photo);
    }

    return images;
  }
}
