/**
 * Media DTOs - Data Transfer Objects for Media
 */

// ============================================
// Response DTOs
// ============================================

export interface UploadMediaResponseDto {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

