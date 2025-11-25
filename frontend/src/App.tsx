import { AnimatePresence, motion, useInView } from 'framer-motion';
import React, { useRef, useState } from 'react';
// Layout Components
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';

// Shared Components  
import {
    CheckoutModal
} from './components/modal';
import {
    ProductGrid
} from './components/product';
import {
    Categories
} from './components/shared';

// Sidebar Components
import {
    CartSidebar,
    FilterSidebar,
    NotificationSidebar,
    PromotionSidebar,
    SupportSidebar,
    WishlistSidebar
} from './components/sidebars';

// Auth Components
import { AuthModal } from './components/auth';

// Search Components
import { SearchModal } from './components/modal/SearchModal';

// Product Detail Modal
import { ProductDetailModal } from './components/product/ProductDetailModal';

// Flying Icon
import { FlyingIcon, FlyingIconConfig } from './components/animation/FlyingIcon';

// Cart Page
import { CartPage } from './components/pages/CartPage';

// Orders Page
import { OrdersPage } from './components/pages/OrdersPage';

// My Store Page
import { MyStorePage } from './components/pages/MyStorePage';

// Store Registration Modal
import { StoreRegistrationModal } from './components/modal/StoreRegistrationModal';

// Hot Deals Section
import { HotDealsSection } from './components/product/HotDealsSection';

// Hooks
import { useCart, useNotifications, useWishlist } from './hooks';

// Types & Data
import {
    initialCartItems,
    initialFAQs,
    initialNotifications,
    initialOrders,
    initialPromotions,
    initialSupportTickets,
    initialUser
} from './data/mockData';
import { generateTicketId } from './lib/utils';
import { FAQItem, FilterState, Order, Promotion, StoreInfo, StoreProduct, SupportTicket, User } from './types';

const motionEase = [0.4, 0, 0.2, 1] as const;

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.35, ease: motionEase }}
  >
    {children}
  </motion.div>
);

const RevealSection = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};

export default function App() {
  // Ref để scroll đến phần sản phẩm
  const productSectionRef = useRef<HTMLDivElement>(null);
  
  // Refs cho icon cart và wishlist trên header
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const wishlistIconRef = useRef<HTMLButtonElement>(null);

  // State cho flying icons animation
  const [flyingIcons, setFlyingIcons] = useState<FlyingIconConfig[]>([]);

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
  
  // State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // State cho product detail modal
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // State cho cart page
  const [isCartPageOpen, setIsCartPageOpen] = useState(false);

  // State cho orders page
  const [isOrdersPageOpen, setIsOrdersPageOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // State cho my store page
  const [isMyStorePageOpen, setIsMyStorePageOpen] = useState(false);

  // State cho store registration modal
  const [isStoreRegistrationOpen, setIsStoreRegistrationOpen] = useState(false);
  
  // State cho store
  const [hasStore, setHasStore] = useState(false); // User chưa có store
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);

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
    deselectAllItems
  } = useCart(initialCartItems);

  const {
    wishlistItems,
    addToWishlist,
    removeFromWishlist
  } = useWishlist();

  // Hàm isInWishlist để check sản phẩm có trong wishlist không
  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
  } = useNotifications(initialNotifications);

  // Other states
  const [promotions] = useState<Promotion[]>(initialPromotions);
  const [faqs] = useState<FAQItem[]>(initialFAQs);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 50000000],
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
    setIsOrdersPageOpen(true);
  };

  const handleViewProduct = (productId: string) => {
    console.log('View product:', productId);
  };

  // Hàm scroll xuống phần sản phẩm khi click category
  const scrollToProducts = () => {
    if (productSectionRef.current) {
      const headerOffset = 80;
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
    const truncatedMessage = message ? `${message.slice(0, 60)}${message.length > 60 ? '…' : ''}` : '';
    const formattedSubject = `[${category}] ${subject}${truncatedMessage ? ` - ${truncatedMessage}` : ''}`;
    const newTicket: SupportTicket = {
      id: generateTicketId(supportTickets.length),
      subject: formattedSubject,
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
    alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ShopMart.');
    const selectedItemIds = getSelectedItems().map(item => item.id);
    selectedItemIds.forEach(id => removeFromCart(id));
  };

  // Hàm xử lý xem chi tiết sản phẩm
  const handleViewProductDetail = (product: any) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  // Hàm trigger flying icon animation
  const handleTriggerFlyingIcon = (type: 'heart' | 'cart', element: HTMLElement) => {
    const targetRef = type === 'heart' ? wishlistIconRef : cartIconRef;
    
    if (!targetRef.current) return;
    
    const startRect = element.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    
    const endRect = targetRef.current.getBoundingClientRect();
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;
    
    const newIcon: FlyingIconConfig = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      startX,
      startY,
      endX,
      endY,
    };
    
    setFlyingIcons(prev => [...prev, newIcon]);
  };

  // Callback khi animation hoàn thành
  const handleAnimationComplete = (id: string) => {
    setFlyingIcons(prev => prev.filter(icon => icon.id !== id));
  };

  // Order functions
  const handleViewOrderDetail = (order: Order) => {
    console.log('View order detail:', order);
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      setOrders(prev => prev.map(order => 
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
    const order = orders.find(o => o.id === orderId);
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
      setIsOrdersPageOpen(false);
    }
  };

  const handleReview = (orderId: string) => {
    alert(`Chức năng đánh giá cho đơn ${orderId} sẽ được phát triển sau`);
  };

  const handleContactShop = (orderId: string) => {
    alert(`Liên hệ shop cho đơn ${orderId} sẽ được phát triển sau`);
  };

  // Store functions
  const handleStoreClick = () => {
    if (!hasStore) {
      setIsStoreRegistrationOpen(true);
    } else {
      setIsMyStorePageOpen(true);
    }
  };

  // Logo click - quay về màn hình chính
  const handleLogoClick = () => {
    setIsCartPageOpen(false);
    setIsOrdersPageOpen(false);
    setIsMyStorePageOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    
    setStoreInfo(fullStoreInfo);
    setHasStore(true);
    setIsStoreRegistrationOpen(false);
    setIsMyStorePageOpen(true);
    
    alert('Chúc mừng! Cửa hàng của bạn đã được tạo thành công!');
  };

  const handleAddProduct = (product: Omit<StoreProduct, 'id'>) => {
    const newProduct: StoreProduct = {
      ...product,
      id: `product-${Date.now()}`
    };
    setStoreProducts(prev => [newProduct, ...prev]);
    
    if (storeInfo) {
      setStoreInfo({
        ...storeInfo,
        totalProducts: storeProducts.length + 1
      });
    }
    
    alert('Sản phẩm đã được thêm thành công!');
  };

  const handleUpdateProduct = (id: string, updates: Partial<StoreProduct>) => {
    setStoreProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates }
        : product
    ));
    alert('Sản phẩm đã được cập nhật!');
  };

  const handleDeleteProduct = (id: string) => {
    setStoreProducts(prev => prev.filter(product => product.id !== id));
    
    if (storeInfo) {
      setStoreInfo({
        ...storeInfo,
        totalProducts: storeProducts.length - 1
      });
    }
    
    alert('Sản phẩm đã được xóa!');
  };

  const sharedHeader = (
    <Header 
      cartItemsCount={getTotalItems()}
      wishlistItemsCount={wishlistItems.length}
      unreadNotifications={getUnreadCount()}
      onCartClick={() => setIsCartPageOpen(true)}
      onWishlistClick={() => setIsWishlistOpen(true)}
      onNotificationsClick={() => setIsNotificationOpen(true)}
      onFilterClick={() => setIsFilterOpen(true)}
      onPromotionClick={() => setIsPromotionOpen(true)}
      onSupportClick={() => setIsSupportOpen(true)}
      onStoreClick={handleStoreClick}
      onLogoClick={handleLogoClick}
      isLoggedIn={isLoggedIn}
      user={user}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={handleLogout}
      onProfileClick={handleProfileClick}
      onOrdersClick={handleOrdersClick}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSearchClick={() => {
        if (searchQuery.trim()) {
          setIsSearchOpen(true);
        }
      }}
      cartIconRef={cartIconRef}
      wishlistIconRef={wishlistIconRef}
      cartItems={cartItems}
      totalPrice={getTotalPrice()}
    />
  );

  let pageKey = 'home';
  let pageContent: React.ReactNode = (
    <>
      {sharedHeader}
      
      <main className="pt-16">
        <RevealSection>
          <Hero />
        </RevealSection>
        
        <RevealSection delay={0.1}>
          <Categories 
            onCategorySelect={(category) => setFilters(prev => ({ ...prev, category }))} 
            onCategoryClick={scrollToProducts}
          />
        </RevealSection>

        <RevealSection delay={0.2}>
          <HotDealsSection
            onAddToCart={addToCart}
            onViewDetail={handleViewProductDetail}
            onAddToWishlist={addToWishlist}
            isInWishlist={isInWishlist}
            onTriggerFlyingIcon={handleTriggerFlyingIcon}
          />
        </RevealSection>
        
        <RevealSection delay={0.3}>
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
                  onViewDetail={handleViewProductDetail}
                  onAddToWishlist={addToWishlist}
                  isInWishlist={isInWishlist}
                  onTriggerFlyingIcon={handleTriggerFlyingIcon}
                />
              </div>
            </div>
          </div>
        </RevealSection>
      </main>

      <Footer />
    </>
  );

  if (isMyStorePageOpen) {
    pageKey = 'my-store';
    pageContent = (
      <>
        {sharedHeader}
        <main className="pt-16 min-h-screen">
          <MyStorePage
            storeProducts={storeProducts}
            storeOrders={orders.filter(o => o.status !== 'cancelled')}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={(orderId, status) => {
              setOrders(prev => prev.map(order => 
                order.id === orderId 
                  ? { 
                      ...order, 
                      status: status as any,
                      updatedAt: new Date().toISOString(),
                      timeline: [
                        ...order.timeline,
                        {
                          status: status as any,
                          timestamp: new Date().toISOString(),
                          description: `Đơn hàng đã chuyển sang trạng thái ${status}`
                        }
                      ]
                    }
                  : order
              ));
            }}
          />
        </main>
        <Footer />
      </>
    );
  } else if (isOrdersPageOpen) {
    pageKey = 'orders';
    pageContent = (
      <OrdersPage
        orders={orders}
        onBack={() => setIsOrdersPageOpen(false)}
        onViewDetail={handleViewOrderDetail}
        onCancelOrder={handleCancelOrder}
        onReorder={handleReorder}
        onReview={handleReview}
        onContactShop={handleContactShop}
      />
    );
  } else if (isCartPageOpen) {
    pageKey = 'cart';
    pageContent = (
      <CartPage
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onToggleSelectItem={toggleSelectItem}
        onSelectAllItems={selectAllItems}
        onDeselectAllItems={deselectAllItems}
        selectedTotalPrice={getSelectedTotalPrice()}
        selectedItems={getSelectedItems()}
        onCheckout={handleCheckout}
        onBack={() => setIsCartPageOpen(false)}
      />
    );
  } else if (isSearchOpen) {
    pageKey = 'search';
    pageContent = (
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        onAddToCart={addToCart}
        initialSearchQuery={searchQuery}
        cartItemsCount={getTotalItems()}
        wishlistItemsCount={wishlistItems.length}
        unreadNotifications={getUnreadCount()}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onNotificationsClick={() => setIsNotificationOpen(true)}
        onPromotionClick={() => setIsPromotionOpen(true)}
        onSupportClick={() => setIsSupportOpen(true)}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        onOrdersClick={handleOrdersClick}
        onViewDetail={handleViewProductDetail}
        onAddToWishlist={addToWishlist}
        isInWishlist={isInWishlist}
        onTriggerFlyingIcon={handleTriggerFlyingIcon}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <PageTransition key={pageKey}>
          {pageContent}
        </PageTransition>
      </AnimatePresence>

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

      <ProductDetailModal
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
      />

      <FlyingIcon
        icons={flyingIcons}
        onComplete={handleAnimationComplete}
      />

      <StoreRegistrationModal
        isOpen={isStoreRegistrationOpen}
        onClose={() => setIsStoreRegistrationOpen(false)}
        onRegister={handleStoreRegistration}
      />
    </div>
  );
}