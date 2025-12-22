/**
 * useCachedProducts - Hook để fetch và cache products
 * Tự động sử dụng cache nếu có và chưa hết hạn
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Product } from '../types';
import { productApi } from '../apis/product';
import { getCache, setCache, CACHE_KEYS } from '../utils/cache';

interface UseCachedProductsOptions {
  page?: number;
  limit?: number;
  categoryId?: string;
  cacheTTL?: number; // Time to live in milliseconds, default 5 minutes
  enabled?: boolean; // Enable/disable fetching
}

interface ProductsResult {
  products: Product[];
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export function useCachedProducts(options: UseCachedProductsOptions = {}) {
  const {
    page = 1,
    limit = 40,
    categoryId,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<ProductsResult['pagination']>();
  const isLoadingRef = useRef(false);

  const cacheKey = CACHE_KEYS.PRODUCTS_PAGE(page, categoryId);

  const fetchProducts = useCallback(async (forceRefresh: boolean = false) => {
    // Tránh fetch nhiều lần đồng thời
    if (isLoadingRef.current) {
      console.log('⏸️ [useCachedProducts] Already fetching, skipping...');
      return;
    }

    // Kiểm tra cache trước
    if (!forceRefresh) {
      const cached = getCache<ProductsResult>(cacheKey);
      if (cached) {
        console.log('✅ [useCachedProducts] Using cached data');
        setProducts(cached.products);
        setPagination(cached.pagination);
        return;
      }
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);

      const queryParams: any = { page, limit };
      if (categoryId && categoryId !== 'all') {
        queryParams.categoryId = categoryId;
      }

      console.log('📦 [useCachedProducts] Fetching products:', queryParams);

      const result = await productApi.getAll(queryParams);

      const productsResult: ProductsResult = {
        products: result.products,
        pagination: result.pagination,
      };

      // Lưu vào cache
      setCache(cacheKey, productsResult, cacheTTL);

      setProducts(result.products);
      setPagination(result.pagination);
    } catch (error) {
      console.error('❌ [useCachedProducts] Error:', error);
      // Nếu có lỗi, thử dùng cache cũ (nếu có)
      const cached = getCache<ProductsResult>(cacheKey);
      if (cached) {
        console.log('⚠️ [useCachedProducts] Using stale cache due to error');
        setProducts(cached.products);
        setPagination(cached.pagination);
      }
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [page, limit, categoryId, cacheKey, cacheTTL]);

  useEffect(() => {
    if (enabled) {
      fetchProducts();
    }
  }, [enabled, fetchProducts]);

  return {
    products,
    loading,
    pagination,
    refetch: () => fetchProducts(true),
  };
}

