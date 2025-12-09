/**
 * Media Service - API service for media upload
 */

import { requestFormData } from '../client/apiClient';
import { UploadMediaResponseDto } from '../../types/dto/media.dto';

export const mediaService = {
  /**
   * Upload file (ảnh, video, etc.)
   */
  upload: (file: File) => {
    // Tạo factory function để có thể tạo lại FormData khi retry
    const formDataFactory = () => {
      const formData = new FormData();
      formData.append('file', file);
      return formData;
    };
    
    return requestFormData<UploadMediaResponseDto>('/media/upload', formDataFactory, true);
  },
};

