/**
 * Product API Module - Export all product-related APIs
 */
// Service (primary)
export * from './product.service';
// Mapper (primary - this is the canonical source for mapProductResponse)
export * from './product.mapper';
// Legacy API - only export unique exports, not duplicates
export { productApi } from './productApi';
