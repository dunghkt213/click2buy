/**
 * useFilters - Custom hook for filter state management
 */
import { useState } from 'react';
const initialFilters = {
    category: 'all',
    priceRange: [0, 50000000],
    brands: [],
    rating: 0,
    inStock: true,
};
export function useFilters() {
    const [filters, setFilters] = useState(initialFilters);
    return {
        filters,
        setFilters,
    };
}
