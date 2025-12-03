/**
 * Product Service - API service for products
 */

import { request } from '../client/apiClient';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  SellerProductQueryDto,
  BackendProductDto,
  DeleteProductResponseDto,
} from '../../types/dto/product.dto';
import { Product, StoreProduct } from '../../types/interface/product.types';
import { mapProductResponse, mapBackendProductToStoreProduct } from './product.mapper';

export const productService = {
  /**
   * Lấy danh sách sản phẩm
   */
  getAll: async (query?: ProductQueryDto): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (query?.category) params.append('category', query.category);
    if (query?.minPrice) params.append('minPrice', query.minPrice.toString());
    if (query?.maxPrice) params.append('maxPrice', query.maxPrice.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    const response = await request<any>(`/products${queryString ? `?${queryString}` : ''}`, {
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
  getById: async (id: string): Promise<Product> => {
    const data = await request<BackendProductDto>(`/products/${id}`, {
      method: 'GET',
      requireAuth: false,
    });
    return mapProductResponse(data);
  },

  /**
   * Tìm kiếm sản phẩm
   */
  search: async (query: ProductQueryDto): Promise<Product[]> => {
    const response = await request<any>('/products/search', {
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
  create: async (dto: CreateProductDto): Promise<Product> => {
    const data = await request<BackendProductDto>('/products', {
      method: 'POST',
      body: JSON.stringify(dto),
      requireAuth: true,
    });
    // Backend có thể trả về trực tiếp hoặc wrap trong data
    const productData = (data as any).data || data;
    return mapProductResponse(productData);
  },

  /**
   * Cập nhật sản phẩm (seller)
   */
  update: async (id: string, dto: UpdateProductDto): Promise<Product> => {
    const data = await request<BackendProductDto>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
      requireAuth: true,
    });
    return mapProductResponse(data);
  },

  /**
   * Xóa sản phẩm (seller)
   */
  remove: async (id: string): Promise<DeleteProductResponseDto> => {
    console.log(`🗑️ [ProductService] Gọi API DELETE /products/${id}`);
    
    const response = await request<any>(`/products/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
    
    console.log('✅ [ProductService] Xóa sản phẩm thành công:', response);
    
    // Backend trả về { success: true, message: '...' } hoặc chỉ message
    if (typeof response === 'object' && response.success !== undefined) {
      return response as DeleteProductResponseDto;
    }
    
    return {
      success: true,
      message: response?.message || 'Sản phẩm đã được xóa thành công',
    };
  },

  /**
   * Lấy tất cả sản phẩm của seller hiện tại
   */
  getAllBySeller: async (query?: SellerProductQueryDto): Promise<StoreProduct[]> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.keyword) params.append('keyword', query.keyword);
    if (query?.sort) params.append('sort', query.sort);
    
    const queryString = params.toString();
    console.log(`🔍 [ProductService] Gọi API GET /products/seller${queryString ? `?${queryString}` : ''}`);
    
    const response = await request<any>(`/products/seller${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
    
    console.log('📥 [ProductService] Response từ API /products/seller (raw):', response);
    console.log('📥 [ProductService] Response type:', typeof response, Array.isArray(response) ? 'Array' : 'Object');
    
    let products: any[] = [];
    
    if (Array.isArray(response)) {
      products = response;
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.data)) {
        products = response.data;
      } else {
        console.error('❌ [ProductService] Dữ liệu không hợp lệ - không phải array:', response);
        throw new Error('Dữ liệu sản phẩm không hợp lệ: không phải array');
      }
    } else {
      console.error('❌ [ProductService] Dữ liệu không hợp lệ:', response);
      throw new Error('Dữ liệu sản phẩm không hợp lệ');
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      console.warn('⚠️ [ProductService] Không có sản phẩm nào:', products);
      return [];
    }
    
    console.log(`📦 [ProductService] Nhận được ${products.length} sản phẩm từ backend`);
    
    // Convert từ backend product response sang StoreProduct
    const storeProducts = products.map(mapBackendProductToStoreProduct);
    console.log('✅ [ProductService] Đã convert sang StoreProduct:', storeProducts.length);
    
    return storeProducts;
  },
};

