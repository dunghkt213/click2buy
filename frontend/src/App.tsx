import React, { useState, useRef } from 'react';
// Layout Components
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';
import { Footer } from './components/layout/Footer';

// Shared Components  
import { 
  Categories
} from './components/shared';
import { 
  CheckoutModal 
} from './components/modal';
import { 
  ProductGrid
} from './components/product';

// Sidebar Components
import {
  CartSidebar,
  FilterSidebar,
  NotificationSidebar,
  WishlistSidebar,
  PromotionSidebar,
  SupportSidebar
} from './components/sidebars';

// Auth Components
import { AuthModal } from './components/auth';

// Search Components
import { SearchModal } from './components/modal/SearchModal';

// Hooks
import { useCart, useWishlist, useNotifications } from './hooks';

// Types & Data
import { FilterState, Promotion, FAQItem, SupportTicket, User } from './types';
import { 
  initialCartItems, 
  initialNotifications, 
  initialPromotions, 
  initialFAQs, 
  initialSupportTickets,
  initialUser 
} from './data/mockData';
import { generateTicketId } from './lib/utils';

export default function App() {
  // THÊM: Ref để scroll đến phần sản phẩm
  const productSectionRef = useRef<HTMLDivElement>(null);

  // Sidebar states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // THÊM: State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Custom hooks
  const {
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
    clearCart
  } = useCart(initialCartItems);

  const {
    wishlistItems,
    addToWishlist,
    removeFromWishlist
  } = useWishlist();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  } = useNotifications(initialNotifications);

  // Other states
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [faqs] = useState<FAQItem[]>(initialFAQs);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 10000000],
    brands: [],
    rating: 0,
    inStock: true,
  });

  // Account functions
  const handleLogin = () => {
    setAuthTab('login');
    setIsAuthOpen(true);
  };

  const handleRegister = () => {
    setAuthTab('register');
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleRegisterSuccess = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(undefined);
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleOrdersClick = () => {
    console.log('Orders clicked');
  };

  const handleViewProduct = (productId: string) => {
    console.log('View product:', productId);
  };

  // THÊM: Hàm scroll xuống phần sản phẩm khi click category
  const scrollToProducts = () => {
    if (productSectionRef.current) {
      const headerOffset = 80; // Chiều cao của header (16 * 4 = 64px + padding)
      const elementPosition = productSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Promotion functions
  const handleClaimPromotion = (id: string) => {
    console.log('Claim promotion:', id);
  };

  const handleUsePromotion = (id: string) => {
    console.log('Use promotion:', id);
  };

  // Support functions
  const handleSubmitTicket = (subject: string, message: string, category: string) => {
    const newTicket: SupportTicket = {
      id: generateTicketId(supportTickets.length),
      subject,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    setSupportTickets(prev => [newTicket, ...prev]);
  };

  // Checkout functions
  const handleCheckout = (checkoutData: any) => {
    console.log('Checkout data:', checkoutData);
    // Here you would typically send the data to your backend
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ShopMart.');
    // Remove only selected items after successful checkout
    const selectedItemIds = getSelectedItems().map(item => item.id);
    selectedItemIds.forEach(id => removeFromCart(id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={getTotalItems()}
        wishlistItemsCount={wishlistItems.length}
        unreadNotifications={getUnreadCount()}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onNotificationsClick={() => setIsNotificationOpen(true)}
        onFilterClick={() => setIsFilterOpen(true)}
        onPromotionClick={() => setIsPromotionOpen(true)}
        onSupportClick={() => setIsSupportOpen(true)}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onOrdersClick={handleOrdersClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      
      <main className="pt-16">
        <Hero />
        <Categories 
          onCategorySelect={(category) => setFilters(prev => ({ ...prev, category }))} 
          onCategoryClick={scrollToProducts}
        />
        
        {/* SỬA: Thêm ref để scroll đến phần này */}
        <div ref={productSectionRef} className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            <FilterSidebar 
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <div className="flex-1">
              <ProductGrid 
                filters={filters}
                onAddToCart={addToCart}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onToggleSelectItem={toggleSelectItem}
        onSelectAllItems={selectAllItems}
        onDeselectAllItems={deselectAllItems}
        selectedTotalPrice={getSelectedTotalPrice()}
        selectedItems={getSelectedItems()}
        onCheckout={() => {
          if (getSelectedItems().length > 0) {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }
        }}
      />

      <NotificationSidebar
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />

      <WishlistSidebar
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistItems}
        onRemoveItem={removeFromWishlist}
        onAddToCart={addToCart}
        onViewProduct={handleViewProduct}
      />

      <PromotionSidebar
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        promotions={promotions}
        onClaimPromotion={handleClaimPromotion}
        onUsePromotion={handleUsePromotion}
      />

      <SupportSidebar
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        faqs={faqs}
        tickets={supportTickets}
        onSubmitTicket={handleSubmitTicket}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={getSelectedItems()}
        totalPrice={getSelectedTotalPrice()}
        onCheckout={handleCheckout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAddToCart={addToCart}
        initialSearchQuery={searchQuery}
      />
    </div>
  );
}