import { Product, StoreProduct } from "../../types";
import { request } from '../client/apiClient';
import { mapBackendProductToStoreProduct, mapProductResponse } from './product.mapper';

// mapProductResponse and mapBackendProductToStoreProduct are imported from product.mapper.ts

// -------------------------------
// Lấy danh sách sản phẩm
// -------------------------------
async function getAll(query?: { 
  category?: string;
  categoryId?: string; 
  minPrice?: number; 
  maxPrice?: number; 
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
  const params = new URLSearchParams();
  if (query?.category) params.append('category', query.category);
  if (query?.categoryId) params.append('categoryId', query.categoryId);
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
  
  // Backend có thể trả về { success: true, data: [...], pagination: {...} } hoặc array trực tiếp
  const products = response?.data || response;
  const pagination = response?.pagination;
  
  if (!products || !Array.isArray(products)) {
    throw new Error("Dữ liệu sản phẩm không hợp lệ");
  }
  
  return {
    products: products.map(mapProductResponse),
    pagination: pagination ? {
      page: pagination.page || 1,
      limit: pagination.limit || 40,
      total: pagination.total || products.length,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || products.length) / (pagination.limit || 40))
    } : undefined
  };
}

// -------------------------------
// Lấy 1 sản phẩm chi tiết
// -------------------------------
async function getById(id: string): Promise<Product> {
  const data = await request<any>(`/products/${id}`, {
    method: 'GET',
    requireAuth: false,
  });
  return mapProductResponse(data);
}

// -------------------------------
// Tìm kiếm sản phẩm
// -------------------------------
async function search(query: { 
  search?: string;
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  brands?: string[];
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}): Promise<Product[]> {
  const requestBody = {
    keyword: query.search || query.keyword,
    category: query.category,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    rating: query.rating,
    brands: query.brands,
    inStock: query.inStock,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  };
  
  console.log('🔍 [productApi.search] Gọi POST /products/search với body:', requestBody);
  
  const response = await request<any>('/products/search', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    requireAuth: false,
  });
  
  console.log('📥 [productApi.search] Response từ API:', response);
  
  // Backend có thể trả về { success: true, data: [...] } hoặc array trực tiếp
  const products = response?.data || response;
  
  console.log('📦 [productApi.search] Products sau khi extract:', products);
  
  if (!products || !Array.isArray(products)) {
    console.error('❌ [productApi.search] Dữ liệu không hợp lệ:', products);
    throw new Error("Dữ liệu tìm kiếm không hợp lệ");
  }
  
  const mappedProducts = products.map(mapProductResponse);
  console.log('✅ [productApi.search] Đã map', mappedProducts.length, 'sản phẩm');
  
  return mappedProducts;
}

// -------------------------------
// Tạo sản phẩm mới (seller)
// -------------------------------
async function create(dto: {
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  brand: string;
  condition?: 'new' | 'used';
  categoryIds?: string[];
  tags?: string[];
  images?: string[];
  attributes?: Record<string, any>;
  variants?: Record<string, any>;
  warehouseAddress?: {
    line1: string;
    line2?: string;
    city: string;
    province?: string;
    country?: string;
    postalCode?: string;
  };
}): Promise<Product> {
  const data = await request<any>('/products', {
    method: 'POST',
    body: JSON.stringify(dto),
    requireAuth: true,
  });
  // Backend có thể trả về trực tiếp hoặc wrap trong data
  const productData = data.data || data;
  return mapProductResponse(productData);
}

// -------------------------------
// Cập nhật sản phẩm (seller)
// -------------------------------
async function update(id: string, dto: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  images?: string[];
  stock?: number;
  brand?: string;
  specifications?: { [key: string]: string };
}): Promise<Product> {
  const data = await request<any>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
    requireAuth: true,
  });
  return mapProductResponse(data);
}

// -------------------------------
// Xóa sản phẩm (seller)
// -------------------------------
async function remove(id: string): Promise<{ success: boolean; message: string }> {
  console.log(`🗑️ [ProductAPI] Gọi API DELETE /products/${id}`);
  
  const response = await request<any>(`/products/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
  
  console.log('✅ [ProductAPI] Xóa sản phẩm thành công:', response);
  
  // Backend trả về { success: true, message: '...' } hoặc chỉ message
  if (typeof response === 'object' && response.success !== undefined) {
    return response as { success: boolean; message: string };
  }
  
  return {
    success: true,
    message: response?.message || 'Sản phẩm đã được xóa thành công'
  };
}

// -------------------------------
// Lấy tất cả sản phẩm của seller hiện tại
// -------------------------------
async function getAllBySeller(query?: {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: string;
}): Promise<StoreProduct[]> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.keyword) params.append('keyword', query.keyword);
  if (query?.sort) params.append('sort', query.sort);
  
  const queryString = params.toString();
  console.log(`🔍 [ProductAPI] Gọi API GET /products/seller${queryString ? `?${queryString}` : ''}`);
  
  const response = await request<any>(`/products/seller${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    requireAuth: true,
  });
  
  console.log('📥 [ProductAPI] Response từ API /products/seller (raw):', response);
  console.log('📥 [ProductAPI] Response type:', typeof response, Array.isArray(response) ? 'Array' : 'Object');
  
  // apiClient trả về payload.data ?? payload
  // Nếu backend trả về { success: true, data: [...], pagination: {...} }
  // thì apiClient sẽ trả về data (array) trực tiếp
  // Nếu backend trả về array trực tiếp, thì apiClient cũng trả về array
  // Nếu backend trả về { success: true, data: [...] } nhưng apiClient đã unwrap, thì response là array
  
  let products: any[] = [];
  
  if (Array.isArray(response)) {
    // Response đã là array rồi (apiClient đã unwrap)
    products = response;
  } else if (response && typeof response === 'object') {
    // Response là object, có thể có data field
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (Array.isArray(response)) {
      products = response;
    } else {
      console.error('❌ [ProductAPI] Dữ liệu không hợp lệ - không phải array:', response);
      throw new Error("Dữ liệu sản phẩm không hợp lệ: không phải array");
    }
  } else {
    console.error('❌ [ProductAPI] Dữ liệu không hợp lệ:', response);
    throw new Error("Dữ liệu sản phẩm không hợp lệ");
  }
  
  if (!Array.isArray(products) || products.length === 0) {
    console.warn('⚠️ [ProductAPI] Không có sản phẩm nào:', products);
    return []; // Trả về array rỗng thay vì throw error
  }
  
  console.log(`📦 [ProductAPI] Nhận được ${products.length} sản phẩm từ backend`);
  console.log('📦 [ProductAPI] Sản phẩm đầu tiên (raw):', products[0]);
  
  // Convert từ backend product response sang StoreProduct
  const storeProducts = products.map(mapBackendProductToStoreProduct);
  console.log('✅ [ProductAPI] Đã convert sang StoreProduct:', storeProducts);
  console.log('✅ [ProductAPI] Sản phẩm đầu tiên (converted):', storeProducts[0]);
  
  return storeProducts;
}

// -------------------------------
// Cập nhật số lượng tồn kho (seller)
// -------------------------------
async function updateStock(id: string, amount: number): Promise<{ success: boolean; message: string; availableStock?: number }> {
  const data = await request<any>(`/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ amount }),
    requireAuth: true,
  });
  
  // Backend có thể trả về { success: true, message: '...', availableStock: ... } hoặc chỉ message
  if (typeof data === 'object' && data.success !== undefined) {
    return data as { success: boolean; message: string; availableStock?: number };
  }
  
  return {
    success: true,
    message: data?.message || 'Cập nhật số lượng thành công',
    availableStock: data?.availableStock,
  };
}

// -------------------------------
// Export giống authApi
// -------------------------------
export const productApi = {
  getAll,
  getById,
  search,
  create,
  update,
  remove,
  getAllBySeller,
  updateStock,
};
