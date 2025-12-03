/**
 * useApp - Main hook that combines all app logic
 * Centralizes state management and handlers
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth, AuthSuccessPayload } from './useAuth';
import { useCartApi } from './useCartApi';
import { useNotifications } from './useNotifications';
import { useFilters } from './useFilters';
import { useSidebars } from './useSidebars';
import { useModals } from './useModals';
import { useFlyingIcons } from './useFlyingIcons';
import { usePageNavigation } from './usePageNavigation';
import { useStore } from './useStore';
import { useOrders } from './useOrders';
import { useCheckout } from './useCheckout';
import { useSupport } from './useSupport';
import { toast } from 'sonner';
import { initialFAQs, initialPromotions, initialSupportTickets } from '../constants/mockData';
import { Order, Product, Promotion, StoreInfo, User, FAQItem } from '../types/interface';

export function useApp() {
  // Auth
  const auth = useAuth();
  const { user, isLoggedIn, handleLoginSuccess: authHandleLoginSuccess, handleRegisterSuccess: authHandleRegisterSuccess, handleAuthCallbackSuccess: authHandleAuthCallbackSuccess, handleLogout } = auth;

  // Flying icons (contains refs)
  const flyingIconsHook = useFlyingIcons();
  const { cartIconRef } = flyingIconsHook;

  // Cart
  const cartApi = useCartApi();
  const {
    cartItems,
    addToCart: addToCartApi,
    removeFromCart: removeFromCartApi,
    updateQuantity: updateQuantityApi,
    getTotalItems,
    getTotalPrice,
    getSelectedTotalPrice,
    getSelectedItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    refreshCart
  } = cartApi;

  // Wrapper cho addToCart
  const addToCart = async (product: any) => {
    const sellerId = product.sellerId || product.ownerId || product.userId;
    if (!sellerId) {
      toast.error('Không tìm thấy thông tin người bán. Vui lòng thử lại.');
      return;
    }
    try {
      await addToCartApi(product, sellerId);
    } catch (error: any) {
      console.error('Add to cart error:', error);
    }
  };

  const removeFromCart = async (productId: string) => {
    await removeFromCartApi(productId);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
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
    getSelectedItems,
    removeFromCart,
    refreshCart,
    onOrderCreated: (order) => {
      orders.setOrders(prev => [order, ...prev]);
      modals.closeCheckout();
      // Navigate to orders page
      window.location.href = '/orders';
    },
  });

  // Support
  const support = useSupport(initialSupportTickets);

  // Static data
  const [promotions] = useState<Promotion[]>(initialPromotions);
  const [faqs] = useState<FAQItem[]>(initialFAQs);

  // Auth handlers với reload
  const handleLoginSuccess = async (payload: AuthSuccessPayload) => {
    await authHandleLoginSuccess(payload);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleRegisterSuccess = async (payload: AuthSuccessPayload) => {
    await authHandleRegisterSuccess(payload);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleAuthCallbackSuccess = async (userData: User, token: string) => {
    await authHandleAuthCallbackSuccess(userData, token);
    window.history.replaceState({}, '', '/');
    modals.hideAuthCallbackModal();
    setTimeout(() => window.location.reload(), 500);
  };

  const handleLogoutWithReload = async () => {
    await handleLogout();
    setTimeout(() => window.location.reload(), 500);
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
    } else {
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
  const handleViewProduct = (productId: string) => {
    console.log('View product:', productId);
  };

  // View product detail handler
  const handleViewProductDetail = (product: Product) => {
    modals.openProductDetail(product);
  };

  // Product actions
  const handleTriggerFlyingIcon = flyingIconsHook.triggerFlyingIcon;

  // Promotion handlers
  const handleClaimPromotion = (id: string) => {
    console.log('Claim promotion:', id);
  };

  const handleUsePromotion = (id: string) => {
    console.log('Use promotion:', id);
  };

  // Order handlers
  const handleViewOrderDetail = (order: Order) => {
    console.log('View order detail:', order);
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      orders.setOrders(prev => prev.map(order =>
        order.id === orderId
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
          : order
      ));
      alert('Đơn hàng đã được hủy thành công');
    }
  };

  const handleReorder = (orderId: string) => {
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
        } as any);
      });
      alert(`Đã thêm ${order.items.length} sản phẩm vào giỏ hàng`);
      orders.setIsOrdersPageOpen(false);
    }
  };

  const handleReview = (orderId: string) => {
    alert(`Chức năng đánh giá cho đơn ${orderId} sẽ được phát triển sau`);
  };

  const handleContactShop = (orderId: string) => {
    alert(`Liên hệ shop cho đơn ${orderId} sẽ được phát triển sau`);
  };

  // Store registration handler
  const handleStoreRegistration = (newStoreInfo: Omit<StoreInfo, 'id' | 'rating' | 'totalReviews' | 'totalProducts' | 'followers' | 'joinedDate'>) => {
    const fullStoreInfo: StoreInfo = {
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
  const handleCheckout = async (checkoutData: any) => {
    await checkout.handleCheckout(checkoutData);
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

