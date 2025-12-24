import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authStorage } from '../apis/auth';
import { cartApi } from '../apis/cart';
import { productApi } from '../apis/product';
import { CACHE_KEYS, getCache, removeCache, setCache } from '../utils/cache';
/**
 * Hook để quản lý giỏ hàng với API backend
 */
export const useCartApi = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    // Ref để track loading state mà không trigger re-render
    const isLoadingRef = useRef(false);
    // Track userId để detect khi user thay đổi
    const currentUserId = authStorage.getUser()?.id;
    const currentUserIdRef = useRef(currentUserId);
    const loadCart = useCallback(async (forceRefresh = false) => {
        // Tránh gọi nhiều lần đồng thời
        if (isLoadingRef.current) {
            console.log('⏸️ [useCartApi] loadCart đang chạy, bỏ qua request mới');
            return;
        }
        // Kiểm tra xem userId có thay đổi không
        const user = authStorage.getUser();
        const currentUserId = user?.id;
        const previousUserId = currentUserIdRef.current;
        // Nếu userId thay đổi, clear cache và force refresh
        if (previousUserId && currentUserId && previousUserId !== currentUserId) {
            console.log('🔄 [useCartApi] User đã thay đổi, clear cache và force refresh');
            removeCache(CACHE_KEYS.CART);
            forceRefresh = true;
        }
        // Cập nhật userId hiện tại
        currentUserIdRef.current = currentUserId;
        // Kiểm tra cache trước (chỉ khi không force refresh và userId không thay đổi)
        if (!forceRefresh) {
            const cached = getCache(CACHE_KEYS.CART);
            if (cached) {
                console.log('✅ [useCartApi] Using cached cart data');
                setCartItems(cached);
                return;
            }
        }
        try {
            isLoadingRef.current = true;
            setLoading(true);
            const response = await cartApi.getAll();
            // Handle response wrapper if exists (response might be array or wrapped)
            const carts = Array.isArray(response)
                ? response
                : (response?.data || []);
            console.log('Cart response from API:', carts);
            // Transform cart response thành CartItem[]
            const items = [];
            // If no carts, return empty array
            if (!carts || carts.length === 0) {
                setCartItems([]);
                return;
            }
            // Collect all product IDs to fetch
            const productPromises = [];
            for (const cart of carts) {
                // Handle case where cart.items might be undefined
                const cartItems = cart.items || [];
                for (const item of cartItems) {
                    if (!item.productId) {
                        console.warn('Cart item missing productId:', item);
                        continue;
                    }
                    productPromises.push(productApi.getById(item.productId)
                        .then(product => ({ product, item, sellerId: cart.sellerId }))
                        .catch(error => {
                        console.error(`Failed to fetch product ${item.productId}:`, error);
                        return { product: null, item, sellerId: cart.sellerId };
                    }));
                }
            }
            // Fetch all products in parallel
            const results = await Promise.all(productPromises);
            // Transform results to CartItem[]
            for (const { product, item, sellerId } of results) {
                // Find the cart ID for this seller
                const cart = carts.find((c) => c.sellerId === sellerId);
                const cartId = cart?._id || cart?.id;
                if (product) {
                    items.push({
                        ...product,
                        id: item.productId,
                        quantity: item.quantity,
                        selected: true,
                        sellerId: sellerId,
                        cartId: cartId,
                    });
                }
                else {
                    // Fallback: use basic info from cart item
                    items.push({
                        id: item.productId,
                        name: `Product ${item.productId}`,
                        price: item.price,
                        quantity: item.quantity,
                        selected: true,
                        sellerId: sellerId,
                        cartId: cartId,
                        image: '',
                        category: '',
                        rating: 0,
                        reviews: 0,
                        description: '',
                        brand: '',
                        inStock: true,
                    });
                }
            }
            console.log('Transformed cart items:', items);
            // Lưu vào cache (TTL: 2 phút - cart thay đổi thường xuyên hơn)
            setCache(CACHE_KEYS.CART, items, 2 * 60 * 1000);
            // Chỉ update state nếu items thực sự thay đổi (tránh re-render không cần thiết)
            setCartItems(prevItems => {
                // So sánh nhanh: nếu số lượng và IDs giống nhau thì không update
                if (prevItems.length === items.length &&
                    prevItems.every((item, idx) => {
                        const newItem = items[idx];
                        return newItem && item.id === newItem.id && item.quantity === newItem.quantity;
                    })) {
                    console.log('⏸️ [useCartApi] Cart items không thay đổi, bỏ qua update');
                    return prevItems;
                }
                console.log('✅ [useCartApi] Cart items đã thay đổi, cập nhật state');
                return items;
            });
        }
        catch (error) {
            console.error('Failed to load cart:', error);
            // Không hiển thị error nếu user chưa đăng nhập
            setCartItems([]);
        }
        finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, []); // Không có dependencies - function ổn định
    // Load cart từ API khi component mount hoặc khi user thay đổi
    useEffect(() => {
        // Force refresh để đảm bảo lấy cart với token mới nhất
        loadCart(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi mount (reload sẽ được handle bởi window.location.reload)
    // Watch userId thay đổi từ authStorage (polling để detect khi user đăng nhập tài khoản khác)
    useEffect(() => {
        const checkUserChange = () => {
            const user = authStorage.getUser();
            const currentUserId = user?.id;
            const previousUserId = currentUserIdRef.current;
            // Nếu userId thay đổi, reload cart
            if (previousUserId && currentUserId && previousUserId !== currentUserId) {
                console.log('🔄 [useCartApi] Phát hiện user thay đổi, reload cart');
                currentUserIdRef.current = currentUserId;
                loadCart(true);
            }
            else if (!previousUserId && currentUserId) {
                // User mới đăng nhập
                currentUserIdRef.current = currentUserId;
                loadCart(true);
            }
            else if (previousUserId && !currentUserId) {
                // User đã logout
                currentUserIdRef.current = undefined;
                setCartItems([]);
                removeCache(CACHE_KEYS.CART);
            }
        };
        // Check mỗi 500ms để detect user change (sau khi reload page)
        const interval = setInterval(checkUserChange, 500);
        // Check ngay lập tức
        checkUserChange();
        return () => clearInterval(interval);
    }, [loadCart]);
    const addToCart = useCallback(async (product, sellerId) => {
        if (!sellerId) {
            toast.error('Không tìm thấy thông tin người bán');
            return;
        }
        console.log('useCartApi.addToCart - Product:', product);
        console.log('useCartApi.addToCart - SellerId:', sellerId);
        try {
            const payload = {
                productId: product.id,
                quantity: 1,
                price: product.price,
                sellerId,
            };
            console.log('useCartApi.addToCart - Payload:', payload);
            await cartApi.addItem(payload);
            // Xóa cache để force reload từ API
            removeCache(CACHE_KEYS.CART);
            // Force refresh từ API (không dùng cache)
            await loadCart(true);
            toast.success('Đã thêm vào giỏ hàng');
        }
        catch (error) {
            console.error('useCartApi.addToCart - Error:', error);
            toast.error(error.message || 'Không thể thêm vào giỏ hàng');
        }
    }, [loadCart]);
    const removeFromCart = useCallback(async (productId, sellerId) => {
        // Tìm sellerId từ cartItems nếu không được cung cấp
        if (!sellerId) {
            const item = cartItems.find(item => item.id === productId);
            if (!item) {
                toast.error('Không tìm thấy sản phẩm trong giỏ hàng');
                return;
            }
            sellerId = item.sellerId;
            if (!sellerId) {
                toast.error('Không tìm thấy thông tin người bán');
                return;
            }
        }
        try {
            await cartApi.removeItem({
                productId,
                sellerId,
            });
            // Xóa cache để force reload từ API
            removeCache(CACHE_KEYS.CART);
            // Force refresh từ API (không dùng cache)
            await loadCart(true);
            toast.success('Đã xóa khỏi giỏ hàng');
        }
        catch (error) {
            console.error('Error removing from cart:', error);
            toast.error(error.message || 'Không thể xóa khỏi giỏ hàng');
        }
    }, [cartItems, loadCart]);
    const updateQuantity = useCallback(async (productId, quantity, sellerId) => {
        if (quantity <= 0) {
            await removeFromCart(productId, sellerId);
            return;
        }
        // Tìm sellerId từ cartItems nếu không được cung cấp
        if (!sellerId) {
            const item = cartItems.find(item => item.id === productId);
            if (!item) {
                toast.error('Không tìm thấy sản phẩm');
                return;
            }
            sellerId = item.sellerId;
            if (!sellerId) {
                toast.error('Không tìm thấy thông tin người bán');
                return;
            }
        }
        try {
            await cartApi.updateQuantity({
                productId,
                quantity,
                sellerId,
            });
            // Xóa cache để force reload từ API
            removeCache(CACHE_KEYS.CART);
            // Force refresh từ API (không dùng cache)
            await loadCart(true);
        }
        catch (error) {
            toast.error(error.message || 'Không thể cập nhật số lượng');
        }
    }, [cartItems, removeFromCart, loadCart]);
    const toggleSelectItem = useCallback((productId) => {
        setCartItems(prev => prev.map(item => item.id === productId ? { ...item, selected: !item.selected } : item));
    }, []);
    const selectAllItems = useCallback(() => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: true })));
    }, []);
    const deselectAllItems = useCallback(() => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: false })));
    }, []);
    const getTotalItems = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);
    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);
    const getSelectedTotalPrice = useCallback(() => {
        return cartItems
            .filter(item => item.selected)
            .reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cartItems]);
    const getSelectedItems = useCallback(() => {
        return cartItems.filter(item => item.selected);
    }, [cartItems]);
    const clearCart = useCallback(() => {
        setCartItems([]);
        removeCache(CACHE_KEYS.CART);
    }, []);
    return {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        getTotalItems,
        getTotalPrice,
        getSelectedTotalPrice,
        getSelectedItems,
        clearCart,
        refreshCart: loadCart,
    };
};
