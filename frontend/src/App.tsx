import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';
import { Footer } from './components/layout/Footer';
import { Categories } from './components/Categories';
import { ProductGrid } from './components/ProductGrid';
import { CartSidebar } from './components/CartSidebar';
import { FilterSidebar } from './components/FilterSidebar';
import { NotificationSidebar } from './components/NotificationSidebar';
import { WishlistSidebar } from './components/WishlistSidebar';
import { PromotionSidebar } from './components/PromotionSidebar';
import { SupportSidebar } from './components/SupportSidebar';
import { useCart, useWishlist, useNotifications } from './hooks';
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
  // Sidebar states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Custom hooks
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice
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
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 10000000],
    brands: [],
    rating: 0,
    inStock: true,
  });

  // Account functions
  const handleLogin = () => {
    setIsLoggedIn(true);
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
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onOrdersClick={handleOrdersClick}
      />
      
      <main className="pt-16">
        <Hero />
        <Categories onCategorySelect={(category) => setFilters(prev => ({ ...prev, category }))} />
        
        <div className="container mx-auto px-4 py-8">
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
        totalPrice={getTotalPrice()}
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
    </div>
  );
}