/**
 * useFilters - Custom hook for filter state management
 */

import { useState } from 'react';
import { FilterState } from '../types/interface';

const initialFilters: FilterState = {
  category: 'all',
  priceRange: [0, 50000000],
  brands: [],
  rating: 0,
  inStock: true,
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  return {
    filters,
    setFilters,
  };
}

