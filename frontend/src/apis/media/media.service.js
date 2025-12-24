/**
 * Media Service - API service for media upload
 */
import { requestFormData } from '../client/apiClient';
export const mediaService = {
    /**
     * Upload file (ảnh, video, etc.)
     */
    upload: (file) => {
        // Tạo factory function để có thể tạo lại FormData khi retry
        const formDataFactory = () => {
            const formData = new FormData();
            formData.append('file', file);
            return formData;
        };
        return requestFormData('/media/upload', formDataFactory, true);
    },
};
