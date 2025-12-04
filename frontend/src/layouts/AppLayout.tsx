/**
 * AppLayout - Main layout component containing Header, Footer, and shared UI elements
 */

import React from 'react';
import { FlyingIcon, FlyingIconConfig } from '../components/animation/FlyingIcon';
import { AuthCallback } from '../components/auth/AuthCallback';
import { AuthModal } from '../components/auth/AuthModal';
import { CartSidebar } from '../components/cart/CartSidebar';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { ProductDetailModal } from '../components/review/ProductDetailModal';
import { NotificationSidebar } from '../components/sidebars/NotificationSidebar';
import { PromotionSidebar } from '../components/sidebars/PromotionSidebar';
import { SupportSidebar } from '../components/sidebars/SupportSidebar';
import { StoreRegistrationModal } from '../components/store/StoreRegistrationModal';
import { AuthSuccessPayload } from '../hooks/useAuth';
import { FAQItem, Product, Promotion, SupportTicket, User } from '../types/interface';

interface AppLayoutProps {
  children: React.ReactNode;
  
  // Auth
  user?: User;
  isLoggedIn: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onLoginSuccess: (payload: AuthSuccessPayload) => Promise<void>;
  onRegisterSuccess: (payload: AuthSuccessPayload) => Promise<void>;
  onAuthCallbackSuccess: (userData: User, token: string) => Promise<void>;
  showAuthCallback: boolean;
  
  // Cart
  cartItems: any[];
  cartItemsCount: number;
  totalPrice: number;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  onRemoveItem: (productId: string) => Promise<void>;
  onToggleSelectItem: (productId: string) => void;
  onSelectAllItems: () => void;
  onDeselectAllItems: () => void;
  selectedTotalPrice: number;
  selectedItems: any[];
  onCheckout: (checkoutData: any) => Promise<void>;
  
  // Notifications
  notifications: any[];
  unreadNotifications: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  
  // Filters
  onFilterClick: () => void;
  
  // Promotions
  promotions: Promotion[];
  onPromotionClick: () => void;
  onClaimPromotion: (id: string) => void;
  onUsePromotion: (id: string) => void;
  
  // Support
  faqs: FAQItem[];
  supportTickets: SupportTicket[];
  onSupportClick: () => void;
  onSubmitTicket: (subject: string, message: string, category: string) => void;
  
  // Store
  onStoreClick: () => void;
  onLogoClick: () => void;
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClick: () => void;
  
  // Profile & Orders
  onProfileClick: () => void;
  onOrdersClick: () => void;
  
  // Sidebars
  isCartOpen: boolean;
  onCartClick?: () => void;
  onCartClose: () => void;
  onOpenCheckout?: () => void;
  isNotificationOpen: boolean;
  onNotificationClick?: () => void;
  onNotificationClose: () => void;
  isPromotionOpen: boolean;
  onPromotionClose: () => void;
  isSupportOpen: boolean;
  onSupportClose: () => void;
  
  // Modals
  isCheckoutOpen: boolean;
  onCheckoutClose: () => void;
  isAuthOpen: boolean;
  onAuthClose: () => void;
  authTab: 'login' | 'register';
  isProductDetailOpen: boolean;
  onProductDetailClose: () => void;
  selectedProduct: Product | null;
  isStoreRegistrationOpen: boolean;
  onStoreRegistrationClose: () => void;
  onStoreRegistration: (storeInfo: any) => void;
  
  // Product actions
  onAddToCart: (product: any) => Promise<void>;
  
  // Flying icons
  flyingIcons: FlyingIconConfig[];
  onAnimationComplete: (id: string) => void;
  onTriggerFlyingIcon?: (type: 'cart', element: HTMLElement) => void;
  
  // Refs
  cartIconRef: React.RefObject<HTMLButtonElement>;
}

export function AppLayout(props: AppLayoutProps) {
  const {
    children,
    user,
    isLoggedIn,
    onLogin,
    onRegister,
    onLogout,
    onLoginSuccess,
    onRegisterSuccess,
    onAuthCallbackSuccess,
    showAuthCallback,
    cartItems,
    cartItemsCount,
    totalPrice,
    onUpdateQuantity,
    onRemoveItem,
    onToggleSelectItem,
    onSelectAllItems,
    onDeselectAllItems,
    selectedTotalPrice,
    selectedItems,
    onCheckout,
    onAddToCart,
    notifications,
    unreadNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onFilterClick,
    promotions,
    onPromotionClick,
    onClaimPromotion,
    onUsePromotion,
    faqs,
    supportTickets,
    onSupportClick,
    onSubmitTicket,
    onStoreClick,
    onLogoClick,
    searchQuery,
    onSearchChange,
    onSearchClick,
    onProfileClick,
    onOrdersClick,
    isCartOpen,
    onCartClick,
    onCartClose,
    onOpenCheckout,
    isNotificationOpen,
    onNotificationClick,
    onNotificationClose,
    isPromotionOpen,
    onPromotionClose,
    isSupportOpen,
    onSupportClose,
    isCheckoutOpen,
    onCheckoutClose,
    isAuthOpen,
    onAuthClose,
    authTab,
    isProductDetailOpen,
    onProductDetailClose,
    selectedProduct,
    isStoreRegistrationOpen,
    onStoreRegistrationClose,
    onStoreRegistration,
    flyingIcons,
    onAnimationComplete,
    onTriggerFlyingIcon,
    cartIconRef,
  } = props;

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemsCount={cartItemsCount}
        unreadNotifications={unreadNotifications}
        onCartClick={onCartClick || onCartClose}
        onNotificationsClick={onNotificationClick || (() => {})}
        onFilterClick={onFilterClick}
        onPromotionClick={onPromotionClick || (() => {})}
        onSupportClick={onSupportClick || (() => {})}
        onStoreClick={onStoreClick}
        onLogoClick={onLogoClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={onLogin}
        onRegister={onRegister}
        cartItems={cartItems}
        totalPrice={totalPrice}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSearchClick={onSearchClick}
        cartIconRef={cartIconRef}
      />

      {children}

      <Footer />

      {/* Sidebars */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={onCartClose}
        items={cartItems}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onToggleSelectItem={onToggleSelectItem}
        onSelectAllItems={onSelectAllItems}
        onDeselectAllItems={onDeselectAllItems}
        selectedTotalPrice={selectedTotalPrice}
        selectedItems={selectedItems}
        onCheckout={() => {
          // CartSidebar sẽ tự xử lý navigation
        }}
      />

      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={onNotificationClose}
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDeleteNotification={onDeleteNotification}
      />

      <PromotionSidebar
        isOpen={isPromotionOpen}
        onClose={onPromotionClose}
        promotions={promotions}
        onClaimPromotion={onClaimPromotion}
        onUsePromotion={onUsePromotion}
      />

      <SupportSidebar
        isOpen={isSupportOpen}
        onClose={onSupportClose}
        faqs={faqs}
        tickets={supportTickets}
        onSubmitTicket={onSubmitTicket}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        defaultTab={authTab}
        onLoginSuccess={onLoginSuccess}
        onRegisterSuccess={onRegisterSuccess}
      />

      {showAuthCallback && (
        <AuthCallback onSuccess={onAuthCallbackSuccess} />
      )}

      <ProductDetailModal
        isOpen={isProductDetailOpen}
        onClose={onProductDetailClose}
        product={selectedProduct}
        onAddToCart={onAddToCart}
        onTriggerFlyingIcon={onTriggerFlyingIcon}
        isLoggedIn={isLoggedIn}
        onLogin={onLogin}
      />

      <FlyingIcon
        icons={flyingIcons}
        onComplete={onAnimationComplete}
      />

      <StoreRegistrationModal
        isOpen={isStoreRegistrationOpen}
        onClose={onStoreRegistrationClose}
        onRegister={onStoreRegistration}
      />
    </div>
  );
}
