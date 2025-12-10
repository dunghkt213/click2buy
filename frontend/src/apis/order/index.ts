/**
 * Order API Module - Export all order-related APIs
 */

// Service (primary)
export * from './order.service';

// Mapper (primary - this is the canonical source for mapOrderResponse)
export * from './order.mapper';

// Legacy API - only export unique exports, not duplicates
export { orderApi } from './orderApi';
export type {
  BackendOrder,
  CreateOrderDto,
} from './orderApi';

