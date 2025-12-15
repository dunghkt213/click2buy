import { SetMetadata } from '@nestjs/common';
import { ImageType } from '../modules/ai-guard/ai.service';

export const AI_IMAGE_TYPE_KEY = 'ai_image_type';

/**
 * Decorator để xác định loại ảnh cần kiểm duyệt
 * @param type - 'PRODUCT_IMAGE' hoặc 'REVIEW_IMAGE'
 */
export const AiImageType = (type: ImageType) => SetMetadata(AI_IMAGE_TYPE_KEY, type);
