/**
 * Product Mapper - Maps backend product responses to frontend types
 */

import { BackendProductDto } from '../../types/dto/product.dto';
import { Product, StoreProduct } from '../../types/interface/product.types';

/**
 * Map backend product response to Product type
 */
export function mapProductResponse(data: BackendProductDto): Product {
  // Ưu tiên salePrice làm giá bán, nếu không có thì dùng price
  const salePrice = data.salePrice || data.sale_price;
  const originalPrice = data.price || data.originalPrice;
  const displayPrice = salePrice || originalPrice; // Giá hiển thị (ưu tiên salePrice)
  
  const mapped: Product = {
    id: data._id || data.id || '',
    name: data.name,
    price: displayPrice, // Giá bán (ưu tiên salePrice)
    originalPrice: salePrice ? originalPrice : undefined, // Giá gốc chỉ hiển thị khi có salePrice
    discount: data.discount,
    image: data.image || (data.images && data.images[0]) || '',
    images: data.images || (data.image ? [data.image] : []),
    category: data.category || (data.categoryIds && data.categoryIds[0]) || '',
    rating: data.rating || data.ratingAvg || 0,
    reviews: data.reviews || 0,
    description: data.description || '',
    brand: data.brand || '',
    inStock: data.inStock ?? (data.isActive !== false),
    stock: typeof data.stock === 'number' ? data.stock : undefined, // Số lượng còn lại trong kho
    isNew: data.isNew,
    isSale: data.isSale || (data.salePrice && data.salePrice < data.price),
    isBestSeller: data.isBestSeller,
    soldCount: data.soldCount,
    reservedStock: data.reservedStock, // Số sản phẩm đã bán
    timeLeft: data.timeLeft,
    specifications: data.specifications || data.attributes,
    // Lưu ownerId để dùng làm sellerId
    ownerId: data.ownerId,
    sellerId: data.ownerId || data.sellerId, // ownerId là sellerId
    reviewSummary: data.reviewSummary, // AI-generated review summary
  };
  
  // Debug log để kiểm tra
  if (!mapped.ownerId && !mapped.sellerId) {
    console.warn('Product missing ownerId/sellerId:', data);
  }
  
  return mapped;
}

/**
 * Map backend product response to StoreProduct type
 */
export function mapBackendProductToStoreProduct(data: BackendProductDto): StoreProduct {
  // Ưu tiên salePrice làm giá bán, nếu không có thì dùng price
  const salePrice = data.salePrice || data.sale_price;
  const originalPrice = data.price || data.originalPrice;
  const displayPrice = salePrice || originalPrice;
  
  // Map categoryIds array thành string
  const categoryStr = data.categoryIds && Array.isArray(data.categoryIds) 
    ? data.categoryIds.join(', ') 
    : '';
  
  // Map status từ backend (ACTIVE/INACTIVE) sang frontend format
  let status: 'active' | 'inactive' | 'out_of_stock' = 'active';
  if (data.isActive === false || data.status === 'INACTIVE') {
    status = 'inactive';
  } else if (data.status === 'OUT_OF_STOCK') {
    status = 'out_of_stock';
  }
  
  return {
    id: data._id || data.id || '',
    name: data.name,
    price: displayPrice, // Giá bán (ưu tiên salePrice)
    originalPrice: salePrice ? originalPrice : undefined, // Giá gốc chỉ hiển thị khi có salePrice
    stock: data.stock || 0,
    // Ưu tiên reservedStock (số đã bán từ backend), sau đó mới đến soldCount
    sold: data.reservedStock ?? data.soldCount ?? 0,
    image: data.images && data.images.length > 0 ? data.images[0] : (data.image || ''),
    images: data.images || (data.image ? [data.image] : []),
    category: categoryStr,
    description: data.description || '',
    status: status,
    createdAt: data.createdAt || new Date().toISOString(),
    rating: data.ratingAvg || data.rating || 0,
    reviews: data.reviews || 0,
  };
}

