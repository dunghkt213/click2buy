/**
 * useApp - Main hook that combines all app logic
 * Centralizes state management and handlers
 */
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initialFAQs, initialPromotions, initialSupportTickets } from '../constants/mockData';
import { useAuth } from './useAuth';
import { useCartApi } from './useCartApi';
import { useCheckout } from './useCheckout';
import { useFilters } from './useFilters';
import { useFlyingIcons } from './useFlyingIcons';
import { useModals } from './useModals';
import { useNotifications } from './useNotifications';
import { useOrders } from './useOrders';
import { usePageNavigation } from './usePageNavigation';
import { useSidebars } from './useSidebars';
import { useStore } from './useStore';
import { useSupport } from './useSupport';
export function useApp() {
    // Auth
    const auth = useAuth();
    const { user, isLoggedIn, handleLoginSuccess: authHandleLoginSuccess, handleRegisterSuccess: authHandleRegisterSuccess, handleAuthCallbackSuccess: authHandleAuthCallbackSuccess, handleLogout } = auth;
    // Flying icons (contains refs)
    const flyingIconsHook = useFlyingIcons();
    const { cartIconRef } = flyingIconsHook;
    // Cart
    const cartApi = useCartApi();
    const { cartItems, addToCart: addToCartApi, removeFromCart: removeFromCartApi, updateQuantity: updateQuantityApi, getTotalItems, getTotalPrice, getSelectedTotalPrice, getSelectedItems, toggleSelectItem, selectAllItems, deselectAllItems, refreshCart } = cartApi;
    // Wrapper cho addToCart
    const addToCart = async (product) => {
        const sellerId = product.sellerId || product.ownerId || product.userId;
        if (!sellerId) {
            toast.error('Không tìm thấy thông tin người bán. Vui lòng thử lại.');
            return;
        }
        try {
            await addToCartApi(product, sellerId);
        }
        catch (error) {
            console.error('Add to cart error:', error);
        }
    };
    const removeFromCart = async (productId) => {
        await removeFromCartApi(productId);
    };
    const updateQuantity = async (productId, quantity) => {
        await updateQuantityApi(productId, quantity);
    };
    // Notifications
    const notifications = useNotifications([]);
    // Filters
    const filters = useFilters();
    // Sidebars
    const sidebars = useSidebars();
    // Modals
    const modals = useModals();
    // Flying icons (already created above)
    // Page navigation
    const navigation = usePageNavigation();
    // Store
    const store = useStore({
        isLoggedIn,
        userRole: user?.role,
        userId: user?.id,
    });
    // Orders
    const orders = useOrders();
    // Checkout
    const checkout = useCheckout({
        onOrderCreated: (order) => {
            orders.setOrders(prev => [order, ...prev]);
            modals.closeCheckout();
            refreshCart();
        },
    });
    // Support
    const support = useSupport(initialSupportTickets);
    // Static data
    const [promotions] = useState(initialPromotions);
    const [faqs] = useState(initialFAQs);
    // Auth handlers với reload
    const handleLoginSuccess = async (payload) => {
        await authHandleLoginSuccess(payload);
        setTimeout(() => window.location.reload(), 500);
    };
    const handleRegisterSuccess = async (payload) => {
        await authHandleRegisterSuccess(payload);
        setTimeout(() => window.location.reload(), 500);
    };
    const handleAuthCallbackSuccess = async (userData, token) => {
        await authHandleAuthCallbackSuccess(userData, token);
        window.history.replaceState({}, '', '/');
        modals.hideAuthCallbackModal();
        setTimeout(() => window.location.reload(), 500);
    };
    const handleLogoutWithReload = async () => {
        try {
            await handleLogout();
        }
        catch (error) {
            console.error('Error during logout:', error);
        }
        finally {
            // Luôn chuyển về trang chủ sau khi đăng xuất, kể cả khi có lỗi
            window.location.href = '/';
        }
    };
    // OAuth callback check
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (window.location.pathname === '/auth/callback' || token) {
            modals.showAuthCallbackModal();
        }
    }, [modals]);
    // Store click handler - navigate to /my-store
    const handleStoreClick = () => {
        if (!isLoggedIn) {
            modals.openAuth('login');
            return;
        }
        if (user?.role === 'seller') {
            // Navigate to my store page
            window.location.href = '/my-store';
            return;
        }
        if (!store.hasStore) {
            modals.openStoreRegistration();
        }
        else {
            window.location.href = '/my-store';
        }
    };
    // Logo click handler - navigate to /feed
    const handleLogoClick = () => {
        window.location.href = '/feed';
    };
    // Profile click handler - navigate to /profile
    const handleProfileClick = () => {
        if (!isLoggedIn) {
            modals.openAuth('login');
            return;
        }
        window.location.href = '/profile';
    };
    // Orders click handler - navigate to /orders
    const handleOrdersClick = async () => {
        if (!isLoggedIn) {
            modals.openAuth('login');
            return;
        }
        window.location.href = '/orders';
    };
    // View product handler
    const handleViewProduct = (productId) => {
        console.log('View product:', productId);
    };
    // View product detail handler - Navigate to product detail page
    const handleViewProductDetail = (product) => {
        window.location.href = `/product/${product.id}`;
    };
    // Product actions
    const handleTriggerFlyingIcon = flyingIconsHook.triggerFlyingIcon;
    // Promotion handlers
    const handleClaimPromotion = (id) => {
        console.log('Claim promotion:', id);
    };
    const handleUsePromotion = (id) => {
        console.log('Use promotion:', id);
    };
    // Order handlers
    const handleViewOrderDetail = (order) => {
        console.log('View order detail:', order);
    };
    const handleCancelOrder = (orderId) => {
        if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            orders.setOrders(prev => prev.map(order => order.id === orderId
                ? {
                    ...order,
                    status: 'cancelled',
                    updatedAt: new Date().toISOString(),
                    timeline: [
                        ...order.timeline,
                        {
                            status: 'cancelled',
                            timestamp: new Date().toISOString(),
                            description: 'Đơn hàng đã bị hủy theo yêu cầu của khách hàng'
                        }
                    ]
                }
                : order));
            alert('Đơn hàng đã được hủy thành công');
        }
    };
    const handleReorder = (orderId) => {
        const order = orders.orders.find(o => o.id === orderId);
        if (order) {
            order.items.forEach(item => {
                addToCart({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    category: 'electronics',
                    rating: 4.5,
                    reviews: 100,
                    description: item.name,
                    brand: 'Brand',
                    inStock: true,
                    quantity: item.quantity,
                    variant: item.variant
                });
            });
            alert(`Đã thêm ${order.items.length} sản phẩm vào giỏ hàng`);
            orders.setIsOrdersPageOpen(false);
        }
    };
    const handleReview = (orderId) => {
        alert(`Chức năng đánh giá cho đơn ${orderId} sẽ được phát triển sau`);
    };
    const handleContactShop = (orderId) => {
        // Find order to get ownerId
        const order = orders.orders.find(o => o.id === orderId);
        if (order) {
            // Try to get ownerId from order (might need to check order structure)
            const shopId = order.ownerId || order.sellerId;
            if (shopId) {
                // Trigger chat với shop
                const event = new CustomEvent('openChat', { detail: { targetUserId: shopId } });
                window.dispatchEvent(event);
            }
            else {
                alert('Không tìm thấy thông tin shop của đơn hàng này');
            }
        }
        else {
            alert('Không tìm thấy đơn hàng');
        }
    };
    // Store registration handler
    const handleStoreRegistration = (newStoreInfo) => {
        const fullStoreInfo = {
            id: `store-${Date.now()}`,
            ...newStoreInfo,
            rating: 0,
            totalReviews: 0,
            totalProducts: 0,
            followers: 0,
            joinedDate: new Date().toISOString()
        };
        store.setStoreInfo(fullStoreInfo);
        store.setHasStore(true);
        modals.closeStoreRegistration();
        store.setIsMyStorePageOpen(true);
        alert('Chúc mừng! Cửa hàng của bạn đã được tạo thành công!');
    };
    // Checkout handler wrapper
    const handleCheckout = async (checkoutData) => {
        return await checkout.handleCheckout(checkoutData);
    };
    return {
        // Refs
        cartIconRef,
        // Auth
        user,
        isLoggedIn,
        handleLogin: () => modals.openAuth('login'),
        handleRegister: () => modals.openAuth('register'),
        handleLoginSuccess,
        handleRegisterSuccess,
        handleAuthCallbackSuccess,
        handleLogout: handleLogoutWithReload,
        // Cart
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        getSelectedTotalPrice,
        getSelectedItems,
        toggleSelectItem,
        selectAllItems,
        deselectAllItems,
        // Notifications
        notifications,
        // Filters
        filters,
        // Sidebars
        sidebars,
        // Modals
        modals,
        // Flying icons
        flyingIcons: flyingIconsHook.flyingIcons,
        handleAnimationComplete: flyingIconsHook.handleAnimationComplete,
        // Navigation
        navigation,
        // Store
        store,
        // Orders
        orders,
        // Support
        support,
        // Static data
        promotions,
        faqs,
        // Handlers
        handleStoreClick,
        handleLogoClick,
        handleProfileClick,
        handleOrdersClick,
        handleViewProduct,
        handleViewProductDetail,
        handleTriggerFlyingIcon,
        handleClaimPromotion,
        handleUsePromotion,
        handleViewOrderDetail,
        handleCancelOrder,
        handleReorder,
        handleReview,
        handleContactShop,
        handleStoreRegistration,
        handleCheckout,
    };
}
