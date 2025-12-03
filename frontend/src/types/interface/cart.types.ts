/**
 * Cart Types - Type definitions for Cart
 */

import { Product } from './product.types';

export interface CartItem extends Product {
  quantity: number;
  selected?: boolean;
  variant?: string;
}

