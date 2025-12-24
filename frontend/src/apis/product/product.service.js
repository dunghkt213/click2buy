/**
 * Product Service - API service for products
 */
import { request } from '../client/apiClient';
import { mapBackendProductToStoreProduct, mapProductResponse } from './product.mapper';
import { productApi } from './productApi';
export const productService = {
    /**
     * Lấy danh sách sản phẩm
     */
    getAll: async (query) => {
        const params = new URLSearchParams();
        if (query?.category)
            params.append('category', query.category);
        if (query?.minPrice)
            params.append('minPrice', query.minPrice.toString());
        if (query?.maxPrice)
            params.append('maxPrice', query.maxPrice.toString());
        if (query?.rating)
            params.append('rating', query.rating.toString());
        if (query?.brands?.length)
            params.append('brands', query.brands.join(','));
        if (query?.inStock !== undefined)
            params.append('inStock', query.inStock ? 'true' : 'false');
        if (query?.search)
            params.append('search', query.search);
        if (query?.page)
            params.append('page', query.page.toString());
        if (query?.limit)
            params.append('limit', query.limit.toString());
        const queryString = params.toString();
        const response = await request(`/products${queryString ? `?${queryString}` : ''}`, {
            method: 'GET',
            requireAuth: false,
        });
        // Backend có thể trả về { success: true, data: [...] } hoặc array trực tiếp
        const products = response?.data || response;
        if (!products || !Array.isArray(products)) {
            throw new Error('Dữ liệu sản phẩm không hợp lệ');
        }
        return products.map(mapProductResponse);
    },
    /**
     * Lấy 1 sản phẩm chi tiết
     */
    getById: async (id) => {
        const data = await request(`/products/${id}`, {
            method: 'GET',
            requireAuth: false,
        });
        return mapProductResponse(data);
    },
    /**
     * Tìm kiếm sản phẩm
     */
    search: async (query) => {
        const response = await request('/products/search', {
            method: 'POST',
            body: JSON.stringify({
                keyword: query.search || query.keyword,
                category: query.category,
                minPrice: query.minPrice,
                maxPrice: query.maxPrice,
                rating: query.rating,
                brands: query.brands,
                inStock: query.inStock,
                sortBy: query.sortBy,
                sortOrder: query.sortOrder,
            }),
            requireAuth: false,
        });
        // Backend có thể trả về { success: true, data: [...] } hoặc array trực tiếp
        const products = response?.data || response;
        if (!products || !Array.isArray(products)) {
            throw new Error('Dữ liệu tìm kiếm không hợp lệ');
        }
        return products.map(mapProductResponse);
    },
    /**
     * Tạo sản phẩm mới (seller)
     */
    create: async (dto) => {
        const data = await request('/products', {
            method: 'POST',
            body: JSON.stringify(dto),
            requireAuth: true,
        });
        // Backend có thể trả về trực tiếp hoặc wrap trong data
        const productData = data.data || data;
        return mapProductResponse(productData);
    },
    /**
     * Cập nhật sản phẩm (seller)
     */
    update: async (id, dto) => {
        const data = await request(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
            requireAuth: true,
        });
        return mapProductResponse(data);
    },
    /**
     * Xóa sản phẩm (seller)
     */
    remove: async (id) => {
        console.log(`🗑️ [ProductService] Gọi API DELETE /products/${id}`);
        const response = await request(`/products/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
        console.log('✅ [ProductService] Xóa sản phẩm thành công:', response);
        // Backend trả về { success: true, message: '...' } hoặc chỉ message
        if (typeof response === 'object' && response.success !== undefined) {
            return response;
        }
        return {
            success: true,
            message: response?.message || 'Sản phẩm đã được xóa thành công',
        };
    },
    /**
     * Lấy tất cả sản phẩm của seller hiện tại
     * Sử dụng userId để filter products theo ownerId
     */
    getAllBySeller: async (sellerId, query) => {
        if (!sellerId) {
            console.warn('⚠️ [ProductService] Không có sellerId - trả về mảng rỗng');
            return [];
        }
        console.log(`🔍 [ProductService] Lấy products cho seller ID: ${sellerId}`);
        try {
            // Load tất cả products và filter theo ownerId
            const result = await productApi.getAll({ limit: 1000 });
            // Filter products theo ownerId (seller ID)
            const sellerProducts = result.products.filter(p => (p.ownerId === sellerId || p.sellerId === sellerId));
            console.log(`📦 [ProductService] Tìm thấy ${sellerProducts.length} sản phẩm của seller ${sellerId}`);
            // Apply additional filters nếu có
            let filtered = sellerProducts;
            if (query?.keyword) {
                const keyword = query.keyword.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(keyword) ||
                    p.description?.toLowerCase().includes(keyword) ||
                    p.brand?.toLowerCase().includes(keyword));
            }
            // Convert từ Product sang StoreProduct
            const storeProducts = filtered.map(mapBackendProductToStoreProduct);
            console.log('✅ [ProductService] Đã convert sang StoreProduct:', storeProducts.length);
            return storeProducts;
        }
        catch (error) {
            console.error('❌ [ProductService] Lỗi khi lấy products của seller:', error);
            throw error;
        }
    },
};
