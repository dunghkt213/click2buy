import { Product } from "../types";
import { request } from './api/apiClient';

// -------------------------------
// Mapping response về đúng Product types
// -------------------------------
export function mapProductResponse(data: any): Product {
  const mapped: Product = {
    id: data._id || data.id,
    name: data.name,
    price: data.price || data.salePrice,
    originalPrice: data.originalPrice || data.price,
    discount: data.discount,
    image: data.image || (data.images && data.images[0]) || '',
    images: data.images || (data.image ? [data.image] : []),
    category: data.category || (data.categoryIds && data.categoryIds[0]) || '',
    rating: data.rating || data.ratingAvg || 0,
    reviews: data.reviews || 0,
    description: data.description || "",
    brand: data.brand || "",
    inStock: data.inStock ?? (data.isActive !== false),
    isNew: data.isNew,
    isSale: data.isSale || (data.salePrice && data.salePrice < data.price),
    isBestSeller: data.isBestSeller,
    soldCount: data.soldCount,
    timeLeft: data.timeLeft,
    specifications: data.specifications || data.attributes,
    // Lưu ownerId để dùng làm sellerId
    ownerId: data.ownerId,
    sellerId: data.ownerId || data.sellerId, // ownerId là sellerId
  };
  
  // Debug log để kiểm tra
  if (!mapped.ownerId && !mapped.sellerId) {
    console.warn('Product missing ownerId/sellerId:', data);
  }
  
  return mapped;
}

// -------------------------------
// Lấy danh sách sản phẩm
// -------------------------------
async function getAll(query?: { 
  category?: string; 
  minPrice?: number; 
  maxPrice?: number; 
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Product[]> {
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
    throw new Error("Dữ liệu sản phẩm không hợp lệ");
  }
  
  return products.map(mapProductResponse);
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
    throw new Error("Dữ liệu tìm kiếm không hợp lệ");
  }
  
  return products.map(mapProductResponse);
}

// -------------------------------
// Tạo sản phẩm mới (seller)
// -------------------------------
async function create(dto: {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  brand?: string;
  specifications?: { [key: string]: string };
}): Promise<Product> {
  const data = await request<any>('/products', {
    method: 'POST',
    body: JSON.stringify(dto),
    requireAuth: true,
  });
  return mapProductResponse(data);
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
  return request<{ success: boolean; message: string }>(`/products/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
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
};
