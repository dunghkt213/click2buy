/**
 * useStore - Custom hook for store management
 */

import { useState, useEffect, useCallback } from 'react';
import { productService } from '../apis/product';
import { productApi } from '../apis/product/productApi';
import { Product } from '../types';
import { StoreInfo, StoreProduct } from '../types/interface';
import { toast } from 'sonner';

interface UseStoreProps {
  isLoggedIn: boolean;
  userRole?: string;
  userId?: string;
}

export function useStore({ isLoggedIn, userRole, userId }: UseStoreProps) {
  const [hasStore, setHasStore] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [isMyStorePageOpen, setIsMyStorePageOpen] = useState(false);

  // Auto set hasStore = true nếu user là seller
  useEffect(() => {
    if (userRole === 'seller') {
      setHasStore(true);
    }
  }, [userRole]);

  // Helper function để load seller products (giống hệt ShopPage)
  const loadSellerProductsByUserId = useCallback(async (sellerId: string): Promise<StoreProduct[]> => {
    try {
      console.log('🛒 [My Store] Bắt đầu load seller products cho userId:', sellerId);
      
      // Load tất cả products và filter theo ownerId (giống ShopPage)
      const allProducts = await productApi.getAll({ limit: 1000 });
      console.log('📦 [My Store] Tổng số products từ API:', allProducts.length);
      
      // Filter products theo ownerId = userId của người đăng nhập (giống ShopPage)
      const filtered = allProducts.filter(p => 
        (p.ownerId === sellerId || p.sellerId === sellerId)
      );
      
      console.log('✅ [My Store] Tìm thấy', filtered.length, 'sản phẩm của seller');
      
      // Convert từ Product sang StoreProduct (giống ShopPage nhưng convert sang StoreProduct)
      const storeProducts: StoreProduct[] = filtered.map((product: Product) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        originalPrice: product.originalPrice,
        stock: 0, // Product không có stock, sẽ cần lấy từ inventory service
        sold: product.soldCount || 0,
        image: product.image,
        images: product.images || (product.image ? [product.image] : []),
        category: product.category || '',
        status: product.inStock ? 'active' : 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: product.rating || 0,
        reviews: product.reviews || 0,
      }));
      
      return storeProducts;
    } catch (error: any) {
      console.error('❌ [My Store] Failed to load seller products:', error);
      throw error;
    }
  }, []);

  // Load seller products từ API khi mở My Store page
  useEffect(() => {
    const loadSellerProducts = async () => {
      if (isMyStorePageOpen && isLoggedIn && userRole === 'seller' && userId) {
        try {
          const storeProducts = await loadSellerProductsByUserId(userId);
          
          if (storeProducts.length === 0) {
            console.warn('⚠️ [My Store] Không có sản phẩm nào được trả về từ API');
            toast.info('Bạn chưa có sản phẩm nào trong cửa hàng. Hãy thêm sản phẩm mới!');
          } else {
            toast.success(`Đã tải ${storeProducts.length} sản phẩm từ cửa hàng của bạn`);
          }
          
          setStoreProducts(storeProducts);
          
          // Cập nhật storeInfo với totalProducts
          setStoreInfo(prev => prev ? {
            ...prev,
            totalProducts: storeProducts.length,
          } : null);
        } catch (error: any) {
          if (error.status === 401) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else {
            toast.error(error.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
          }
          setStoreProducts([]);
        }
      }
    };

    loadSellerProducts();
  }, [isMyStorePageOpen, isLoggedIn, userRole, userId, loadSellerProductsByUserId]);

  const handleAddProduct = useCallback(async (productFormData: {
    name: string;
    description: string;
    price: number;
    salePrice: number;
    stock: number;
    brand: string;
    condition: 'new' | 'used';
    categoryIds: string[];
    tags: string[];
    images: string[];
    attributes: Record<string, any>;
    variants: Record<string, any>;
    warehouseAddress: {
      line1: string;
      city: string;
      province: string;
      country: string;
      postalCode: string;
    };
    isActive: boolean;
  }) => {
    try {
      // Chuẩn bị warehouseAddress
      const warehouseAddress: any = {
        line1: productFormData.warehouseAddress.line1,
        city: productFormData.warehouseAddress.city,
      };
      if (productFormData.warehouseAddress.province) {
        warehouseAddress.province = productFormData.warehouseAddress.province;
      }
      if (productFormData.warehouseAddress.country) {
        warehouseAddress.country = productFormData.warehouseAddress.country;
      }
      if (productFormData.warehouseAddress.postalCode) {
        warehouseAddress.postalCode = productFormData.warehouseAddress.postalCode;
      }

      // Gọi API POST product
      const createdProduct = await productService.create({
        name: productFormData.name,
        description: productFormData.description || undefined,
        price: productFormData.price,
        salePrice: productFormData.salePrice > 0 ? productFormData.salePrice : undefined,
        stock: productFormData.stock || undefined,
        brand: productFormData.brand,
        condition: productFormData.condition,
        categoryIds: productFormData.categoryIds.length > 0 ? productFormData.categoryIds : undefined,
        tags: productFormData.tags.length > 0 ? productFormData.tags : undefined,
        images: productFormData.images.length > 0 ? productFormData.images : undefined,
        attributes: Object.keys(productFormData.attributes).length > 0 ? productFormData.attributes : undefined,
        variants: Object.keys(productFormData.variants).length > 0 ? productFormData.variants : undefined,
        warehouseAddress: warehouseAddress.line1 && warehouseAddress.city ? warehouseAddress : undefined,
      });

      toast.success('Sản phẩm đã được thêm thành công!');
      
      // Reload seller products từ API (giống ShopPage)
      if (isMyStorePageOpen && userRole === 'seller' && userId) {
        try {
          const products = await loadSellerProductsByUserId(userId);
          setStoreProducts(products);
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: products.length,
            });
          }
        } catch (err) {
          console.error('Failed to reload seller products:', err);
        }
      }
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    }
  }, [isMyStorePageOpen, userRole, storeInfo, userId, loadSellerProductsByUserId]);

  const handleUpdateProduct = useCallback(async (id: string, updates: Partial<StoreProduct>) => {
    try {
      // TODO: Implement API call to update product
      setStoreProducts(prev => prev.map(product => 
        product.id === id 
          ? { ...product, ...updates }
          : product
      ));
      toast.success('Sản phẩm đã được cập nhật!');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại.');
    }
  }, []);

  const handleDeleteProduct = useCallback(async (id: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.');
    
    if (!confirmed) {
      return;
    }
    
    try {
      const result = await productService.remove(id);
      
      // Reload seller products từ API (giống ShopPage)
      if (userRole === 'seller' && userId) {
        try {
          const products = await loadSellerProductsByUserId(userId);
          setStoreProducts(products);
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: products.length,
            });
          }
        } catch (err: any) {
          console.error('❌ [My Store] Failed to reload seller products:', err);
          setStoreProducts(prev => prev.filter(product => product.id !== id));
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: storeProducts.length - 1,
            });
          }
        }
      }
      
      toast.success(result.message || 'Sản phẩm đã được xóa thành công!');
    } catch (error: any) {
      console.error('❌ [My Store] Failed to delete product:', error);
      
      if (error.status === 403) {
        toast.error('Bạn không có quyền xóa sản phẩm này.');
      } else if (error.status === 404) {
        toast.error('Không tìm thấy sản phẩm để xóa.');
      } else if (error.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
  }, [isMyStorePageOpen, userRole, storeInfo, storeProducts.length, userId, loadSellerProductsByUserId]);

  const handleStoreRegistration = useCallback((newStoreInfo: Omit<StoreInfo, 'id' | 'rating' | 'totalReviews' | 'totalProducts' | 'followers' | 'joinedDate'>) => {
    const fullStoreInfo: StoreInfo = {
      id: `store-${Date.now()}`,
      ...newStoreInfo,
      rating: 0,
      totalReviews: 0,
      totalProducts: 0,
      followers: 0,
      joinedDate: new Date().toISOString(),
    };
    
    setStoreInfo(fullStoreInfo);
    setHasStore(true);
  }, []);

  return {
    hasStore,
    storeInfo,
    storeProducts,
    isMyStorePageOpen,
    setHasStore,
    setStoreInfo,
    setStoreProducts,
    setIsMyStorePageOpen,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleStoreRegistration,
  };
}

