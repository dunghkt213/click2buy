import { requestFormData } from '../client/apiClient';

export interface UploadMediaResponse {
  success: boolean;
  url: {
    fileId: string;
    thumbnailUrl: string;
  };
}

export const mediaApi = {
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
    
    return requestFormData<UploadMediaResponse>('/media/upload', formDataFactory, true);
  },
};

