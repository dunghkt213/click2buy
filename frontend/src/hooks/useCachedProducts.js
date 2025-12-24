/**
 * useCachedProducts - Hook để fetch và cache products
 * Tự động sử dụng cache nếu có và chưa hết hạn
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { productApi } from '../apis/product';
import { getCache, setCache, CACHE_KEYS } from '../utils/cache';
export function useCachedProducts(options = {}) {
    const { page = 1, limit = 40, categoryId, cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enabled = true, } = options;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState();
    const isLoadingRef = useRef(false);
    const cacheKey = CACHE_KEYS.PRODUCTS_PAGE(page, categoryId);
    const fetchProducts = useCallback(async (forceRefresh = false) => {
        // Tránh fetch nhiều lần đồng thời
        if (isLoadingRef.current) {
            console.log('⏸️ [useCachedProducts] Already fetching, skipping...');
            return;
        }
        // Kiểm tra cache trước
        if (!forceRefresh) {
            const cached = getCache(cacheKey);
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
            const queryParams = { page, limit };
            if (categoryId && categoryId !== 'all') {
                queryParams.categoryId = categoryId;
            }
            console.log('📦 [useCachedProducts] Fetching products:', queryParams);
            const result = await productApi.getAll(queryParams);
            const productsResult = {
                products: result.products,
                pagination: result.pagination,
            };
            // Lưu vào cache
            setCache(cacheKey, productsResult, cacheTTL);
            setProducts(result.products);
            setPagination(result.pagination);
        }
        catch (error) {
            console.error('❌ [useCachedProducts] Error:', error);
            // Nếu có lỗi, thử dùng cache cũ (nếu có)
            const cached = getCache(cacheKey);
            if (cached) {
                console.log('⚠️ [useCachedProducts] Using stale cache due to error');
                setProducts(cached.products);
                setPagination(cached.pagination);
            }
        }
        finally {
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
