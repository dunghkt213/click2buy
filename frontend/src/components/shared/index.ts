/**
 * SHARED COMPONENTS
 * ==================
 * Reusable components used across multiple features.
 * These components are feature-agnostic and can be used anywhere in the app.
 * 
 * UI Components Used:
 * - Card, Button, Badge (ProductCard, ProductGrid)
 * - Dialog, DialogContent (CheckoutModal)
 * - DropdownMenu (AccountDropdown)
 * - Various form components and icons
 * 
 * Usage:
 * import { ProductCard, Categories, ... } from './components/shared';
 */

// Re-export từ components root (chưa di chuyển)
export { ProductCard } from '../product/ProductCard';
export { ProductGrid } from '../product/ProductGrid';
export { Categories } from '../Categories';
export { AccountDropdown } from '../AccountDropdown';
export { CheckoutModal } from '../CheckoutModal';
