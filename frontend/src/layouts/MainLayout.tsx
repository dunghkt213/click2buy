/**
 * MainLayout - Layout wrapper that includes Header, Footer, and all global UI elements
 * This wraps all pages that need the full app layout
 */

import { ReactNode, useEffect } from 'react';
import { AppLayout } from './AppLayout';
import { useAppContext } from '../providers/AppProvider';
import { useNotificationContext } from '../contexts/NotificationContext';
import { mapBackendNotificationToNotification } from '../utils/notificationMapper';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const app = useAppContext();
  
  // Ưu tiên sử dụng NotificationContext nếu có (realtime từ WebSocket)
  // Fallback về app.notifications (legacy) nếu không có context
  let notificationContext;
  try {
    notificationContext = useNotificationContext();
  } catch {
    // NotificationContext không có, sử dụng legacy
    notificationContext = null;
  }

  // Lắng nghe event để mở notification sidebar từ NotificationLog
  useEffect(() => {
    const handleOpenNotifications = () => {
      app.sidebars.openNotification();
    };
    
    window.addEventListener('openNotifications', handleOpenNotifications);
    return () => {
      window.removeEventListener('openNotifications', handleOpenNotifications);
    };
  }, [app.sidebars]);

  // Map notifications từ context hoặc legacy
  const notifications = notificationContext
    ? notificationContext.notifications.map(mapBackendNotificationToNotification)
    : app.notifications.notifications;
  
  const unreadNotifications = notificationContext
    ? notificationContext.unreadCount
    : app.notifications.getUnreadCount();

  const handleMarkAsRead = (id: string) => {
    if (notificationContext) {
      notificationContext.markAsRead(id);
    } else {
      app.notifications.markAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (notificationContext) {
      notificationContext.markAllAsRead();
    } else {
      app.notifications.markAllAsRead();
    }
  };

  const handleDeleteNotification = (id: string) => {
    if (!notificationContext) {
      app.notifications.deleteNotification(id);
    }
    // Note: Backend không có delete, chỉ có thể đánh dấu đã đọc
  };

  return (
    <AppLayout
      user={app.user}
      isLoggedIn={app.isLoggedIn}
      onLogin={app.handleLogin}
      onRegister={app.handleRegister}
      onLogout={app.handleLogout}
      onLoginSuccess={app.handleLoginSuccess}
      onRegisterSuccess={app.handleRegisterSuccess}
      onAuthCallbackSuccess={app.handleAuthCallbackSuccess}
      showAuthCallback={app.modals.showAuthCallback}
      cartItems={app.cartItems}
      cartItemsCount={app.getTotalItems()}
      totalPrice={app.getTotalPrice()}
      onUpdateQuantity={app.updateQuantity}
      onRemoveItem={app.removeFromCart}
      onToggleSelectItem={app.toggleSelectItem}
      onSelectAllItems={app.selectAllItems}
      onDeselectAllItems={app.deselectAllItems}
      selectedTotalPrice={app.getSelectedTotalPrice()}
      selectedItems={app.getSelectedItems()}
      onCheckout={app.handleCheckout}
      onAddToCart={app.addToCart}
      notifications={notifications}
      unreadNotifications={unreadNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDeleteNotification}
      onFilterClick={() => app.sidebars.openFilter()}
      promotions={app.promotions}
      onPromotionClick={() => app.sidebars.openPromotion()}
      onClaimPromotion={app.handleClaimPromotion}
      onUsePromotion={app.handleUsePromotion}
      faqs={app.faqs}
      supportTickets={app.support.supportTickets}
      onSupportClick={() => app.sidebars.openSupport()}
      onSubmitTicket={app.support.handleSubmitTicket}
      onStoreClick={app.handleStoreClick}
      onLogoClick={app.handleLogoClick}
      searchQuery={app.modals.searchQuery}
      onSearchChange={app.modals.setSearchQuery}
      onSearchClick={() => {
        if (app.modals.searchQuery?.trim()) {
          // Navigate to search page or open search modal
          window.location.href = `/search?q=${encodeURIComponent(app.modals.searchQuery)}`;
        }
      }}
      onProfileClick={app.handleProfileClick}
      onOrdersClick={app.handleOrdersClick}
      isCartOpen={app.sidebars.isCartOpen}
      onCartClick={() => {
        // Navigate to cart page instead of opening sidebar
        window.location.href = '/cart';
      }}
      onCartClose={() => app.sidebars.closeCart()}
      onOpenCheckout={() => app.modals.openCheckout()}
      isNotificationOpen={app.sidebars.isNotificationOpen}
      onNotificationClick={() => app.sidebars.openNotification()}
      onNotificationClose={() => app.sidebars.closeNotification()}
      isPromotionOpen={app.sidebars.isPromotionOpen}
      onPromotionClose={() => app.sidebars.closePromotion()}
      isSupportOpen={app.sidebars.isSupportOpen}
      onSupportClose={() => app.sidebars.closeSupport()}
      isProductDetailOpen={app.modals.isProductDetailOpen}
      selectedProduct={app.modals.selectedProduct}
      onProductDetailClose={() => app.modals.closeProductDetail()}
      flyingIcons={app.flyingIcons}
      onAnimationComplete={app.handleAnimationComplete}
      onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
      cartIconRef={app.cartIconRef}
      isCheckoutOpen={app.modals.isCheckoutOpen}
      onCheckoutClose={() => app.modals.closeCheckout()}
      isAuthOpen={app.modals.isAuthOpen}
      authTab={app.modals.authTab}
      onAuthClose={() => app.modals.closeAuth()}
      isStoreRegistrationOpen={app.modals.isStoreRegistrationOpen}
      onStoreRegistrationClose={() => app.modals.closeStoreRegistration()}
      onStoreRegistration={app.handleStoreRegistration}
    >
      {children}
    </AppLayout>
  );
}
