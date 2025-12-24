/**
 * useStore - Custom hook for store management
 */
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../apis/product';
import { productApi } from '../apis/product/productApi';
import { toast } from 'sonner';
export function useStore({ isLoggedIn, userRole, userId }) {
    const [hasStore, setHasStore] = useState(false);
    const [storeInfo, setStoreInfo] = useState(null);
    const [storeProducts, setStoreProducts] = useState([]);
    const [isMyStorePageOpen, setIsMyStorePageOpen] = useState(false);
    // Auto set hasStore = true nếu user là seller
    useEffect(() => {
        if (userRole === 'seller') {
            setHasStore(true);
        }
    }, [userRole]);
    // Helper function để load seller products từ API /products/seller (có stock từ inventory-service)
    const loadSellerProductsByUserId = useCallback(async (sellerId) => {
        try {
            console.log('🛒 [My Store] Bắt đầu load seller products cho userId:', sellerId);
            // Sử dụng API /products/seller để lấy products với stock từ inventory-service
            const storeProducts = await productApi.getAllBySeller({
                limit: 1000,
            });
            console.log('📦 [My Store] Nhận được', storeProducts.length, 'sản phẩm từ API /products/seller');
            // Log stock của từng sản phẩm để debug
            storeProducts.forEach((product, index) => {
                console.log(`  📦 [My Store] Product ${index + 1} "${product.name}": stock = ${product.stock} (type: ${typeof product.stock})`);
            });
            return storeProducts;
        }
        catch (error) {
            console.error('❌ [My Store] Failed to load seller products:', error);
            throw error;
        }
    }, []);
    // Load seller products từ API khi mở My Store page
    useEffect(() => {
        // Chỉ load khi page được mở và user đã đăng nhập
        if (!isMyStorePageOpen || !isLoggedIn || userRole !== 'seller' || !userId) {
            return;
        }
        let isMounted = true;
        const loadSellerProducts = async () => {
            try {
                const storeProducts = await loadSellerProductsByUserId(userId);
                // Chỉ update state nếu component vẫn còn mounted
                if (!isMounted)
                    return;
                if (storeProducts.length === 0) {
                    console.warn('⚠️ [My Store] Không có sản phẩm nào được trả về từ API');
                    // Chỉ hiện toast khi component đã mount xong
                    setTimeout(() => {
                        if (isMounted) {
                            toast.info('Bạn chưa có sản phẩm nào trong cửa hàng. Hãy thêm sản phẩm mới!');
                        }
                    }, 0);
                }
                else {
                    // Chỉ hiện toast khi component đã mount xong
                    setTimeout(() => {
                        if (isMounted) {
                            toast.success(`Đã tải ${storeProducts.length} sản phẩm từ cửa hàng của bạn`);
                        }
                    }, 0);
                }
                setStoreProducts(storeProducts);
                // Cập nhật storeInfo với totalProducts
                setStoreInfo(prev => prev ? {
                    ...prev,
                    totalProducts: storeProducts.length,
                } : null);
            }
            catch (error) {
                if (!isMounted)
                    return;
                // Chỉ hiện toast khi component đã mount xong
                setTimeout(() => {
                    if (isMounted) {
                        if (error.status === 401) {
                            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        }
                        else {
                            toast.error(error.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
                        }
                    }
                }, 0);
                setStoreProducts([]);
            }
        };
        loadSellerProducts();
        return () => {
            isMounted = false;
        };
    }, [isMyStorePageOpen, isLoggedIn, userRole, userId, loadSellerProductsByUserId]);
    const handleAddProduct = useCallback(async (productFormData) => {
        try {
            // Chuẩn bị warehouseAddress
            const warehouseAddress = {
                line1: productFormData.warehouseAddress.line1,
                city: productFormData.warehouseAddress.city,
            };
            if (productFormData.warehouseAddress.line2) {
                warehouseAddress.line2 = productFormData.warehouseAddress.line2;
            }
            if (productFormData.warehouseAddress.province) {
                warehouseAddress.province = productFormData.warehouseAddress.province;
            }
            if (productFormData.warehouseAddress.country) {
                warehouseAddress.country = productFormData.warehouseAddress.country;
            }
            if (productFormData.warehouseAddress.postalCode) {
                warehouseAddress.postalCode = productFormData.warehouseAddress.postalCode;
            }
            // Chuẩn bị data để gọi API
            const apiData = {
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
            };
            console.log('🚀 [useStore] Calling productService.create with data:', apiData);
            // Gọi API POST product
            const createdProduct = await productService.create(apiData);
            console.log('✅ [useStore] Product created successfully:', createdProduct);
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
                }
                catch (err) {
                    console.error('Failed to reload seller products:', err);
                }
            }
        }
        catch (error) {
            console.error('Failed to add product:', error);
            toast.error(error.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
        }
    }, [isMyStorePageOpen, userRole, storeInfo, userId, loadSellerProductsByUserId]);
    const handleUpdateProduct = useCallback(async (id, updates) => {
        try {
            // TODO: Implement API call to update product
            setStoreProducts(prev => prev.map(product => product.id === id
                ? { ...product, ...updates }
                : product));
            toast.success('Sản phẩm đã được cập nhật!');
        }
        catch (error) {
            console.error('Failed to update product:', error);
            toast.error(error.message || 'Không thể cập nhật sản phẩm. Vui lòng thử lại.');
        }
    }, []);
    const handleDeleteProduct = useCallback(async (id) => {
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
                }
                catch (err) {
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
        }
        catch (error) {
            console.error('❌ [My Store] Failed to delete product:', error);
            if (error.status === 403) {
                toast.error('Bạn không có quyền xóa sản phẩm này.');
            }
            else if (error.status === 404) {
                toast.error('Không tìm thấy sản phẩm để xóa.');
            }
            else if (error.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
            else {
                toast.error(error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
            }
        }
    }, [isMyStorePageOpen, userRole, storeInfo, storeProducts.length, userId, loadSellerProductsByUserId]);
    const handleStoreRegistration = useCallback((newStoreInfo) => {
        const fullStoreInfo = {
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
