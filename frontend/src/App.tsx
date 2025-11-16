import { useRef, useState } from 'react';
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

// THÊM: Product Detail Modal
import { ProductDetailModal } from './components/product/ProductDetailModal';

// THÊM: Flying Icon
import { FlyingIcon, FlyingIconConfig } from './components/animation/FlyingIcon';

// THÊM: Cart Page
import { CartPage } from './components/pages/CartPage';

// THÊM: Orders Page
import { OrdersPage } from './components/pages/OrdersPage';

// THÊM: My Store Page
import { MyStorePage } from './components/pages/MyStorePage.tsx';

// Hooks
import { useCart, useNotifications, useWishlist } from './hooks';

// Types & Data
import {
  initialCartItems,
  initialFAQs,
  initialNotifications,
  initialOrders,
  initialPromotions, // THÊM: initialOrders
  initialStoreProducts,
  initialSupportTickets,
  initialUser
} from './data/mockData';
import { generateTicketId } from './lib/utils';
import { FAQItem, FilterState, Order, Promotion, SupportTicket, User } from './types'; // THÊM: Store types

export default function App() {
  // THÊM: Ref để scroll đến phần sản phẩm
  const productSectionRef = useRef<HTMLDivElement>(null);
  
  // THÊM: Refs cho icon cart và wishlist trên header
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const wishlistIconRef = useRef<HTMLButtonElement>(null);

  // THÊM: State cho flying icons animation
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
  
  // THÊM: State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // THÊM: State cho product detail modal
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // THÊM: State cho cart page
  const [isCartPageOpen, setIsCartPageOpen] = useState(false);

  // THÊM: State cho orders page
  const [isOrdersPageOpen, setIsOrdersPageOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // THÊM: State cho my store page
  const [isMyStorePageOpen, setIsMyStorePageOpen] = useState(false);

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

  // THÊM: Hàm isInWishlist để check sản phẩm có trong wishlist không
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
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [faqs] = useState<FAQItem[]>(initialFAQs);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(initialSupportTickets);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // THAY ĐỔI: Đặt true để mặc định đã đăng nhập
  const [user, setUser] = useState<User | undefined>(initialUser); // THAY ĐỔI: Sử dụng initialUser từ mockData
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
    setIsOrdersPageOpen(true); // THAY ĐỔI: Mở orders page
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

  // THÊM: Hàm xử lý xem chi tiết sản phẩm
  const handleViewProductDetail = (product: any) => {
    setSelectedProduct(product);
    setIsProductDetailOpen(true);
  };

  // THÊM: Hàm trigger flying icon animation
  const handleTriggerFlyingIcon = (type: 'heart' | 'cart', element: HTMLElement) => {
    const targetRef = type === 'heart' ? wishlistIconRef : cartIconRef;
    
    if (!targetRef.current) return;
    
    // Lấy vị trí của element được click
    const startRect = element.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    
    // Lấy vị trí của icon đích trên header
    const endRect = targetRef.current.getBoundingClientRect();
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;
    
    // Tạo flying icon config
    const newIcon: FlyingIconConfig = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      startX,
      startY,
      endX,
      endY,
    };
    
    // Thêm icon vào danh sách
    setFlyingIcons(prev => [...prev, newIcon]);
  };

  // THÊM: Callback khi animation hoàn thành
  const handleAnimationComplete = (id: string) => {
    setFlyingIcons(prev => prev.filter(icon => icon.id !== id));
  };

  // THÊM: Order functions
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
      // Add all items from order back to cart
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
    alert('Chức năng đánh giá sẽ được phát triển sau');
  };

  const handleContactShop = (orderId: string) => {
    alert('Chức năng liên hệ shop sẽ được phát triển sau');
  };

  return (
    <div className="min-h-screen bg-background">
      {isMyStorePageOpen ? (
        /* THÊM: My Store Page - Màn hình cửa hàng của tôi với Header + Footer */
        <>
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
            onStoreClick={() => setIsMyStorePageOpen(false)} // Click lại để đóng
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
          
          <main className="pt-16 min-h-screen">
            <MyStorePage
              storeProducts={initialStoreProducts}
              storeOrders={orders.filter(o => o.status !== 'cancelled')}
              onAddProduct={() => console.log('Add product')}
              onUpdateProduct={() => console.log('Update product')}
              onDeleteProduct={() => console.log('Delete product')}
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
      ) : isOrdersPageOpen ? (
        /* THÊM: Orders Page - Màn hình đơn hàng của tôi */
        <OrdersPage
          orders={orders}
          onBack={() => setIsOrdersPageOpen(false)}
          onViewDetail={handleViewOrderDetail}
          onCancelOrder={handleCancelOrder}
          onReorder={handleReorder}
          onReview={handleReview}
          onContactShop={handleContactShop}
        />
      ) : isCartPageOpen ? (
        /* THÊM: Cart Page - Màn hình giỏ hàng đầy đủ */
        <CartPage
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onToggleSelectItem={toggleSelectItem}
          onSelectAllItems={selectAllItems}
          onDeselectAllItems={deselectAllItems}
          selectedTotalPrice={getSelectedTotalPrice()}
          selectedItems={getSelectedItems()}
          onCheckout={handleCheckout} // SỬA: Truyền handleCheckout trực tiếp
          onBack={() => setIsCartPageOpen(false)}
        />
      ) : !isSearchOpen ? (
        <>
          <Header 
            cartItemsCount={getTotalItems()}
            wishlistItemsCount={wishlistItems.length}
            unreadNotifications={getUnreadCount()}
            onCartClick={() => setIsCartPageOpen(true)} // THAY ĐỔI: Mở cart page thay vì sidebar
            onWishlistClick={() => setIsWishlistOpen(true)}
            onNotificationsClick={() => setIsNotificationOpen(true)}
            onFilterClick={() => setIsFilterOpen(true)}
            onPromotionClick={() => setIsPromotionOpen(true)}
            onSupportClick={() => setIsSupportOpen(true)}
            onStoreClick={() => setIsMyStorePageOpen(true)} // THÊM: Mở my store page
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
            cartItems={cartItems} // THÊM: Truyền cart items cho preview
            totalPrice={getTotalPrice()} // THÊM: Truyền total price cho preview
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
                    onViewDetail={handleViewProductDetail}
                    onAddToWishlist={addToWishlist} // THÊM: Truyền addToWishlist
                    isInWishlist={isInWishlist} // THÊM: Truyền isInWishlist
                    onTriggerFlyingIcon={handleTriggerFlyingIcon} // THÊM: Truyền flying icon handler
                  />
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </>
      ) : (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery(''); // Clear search query khi đóng
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
          onViewDetail={handleViewProductDetail} // THÊM: Truyền handleViewProductDetail
          onAddToWishlist={addToWishlist} // THÊM: Truyền addToWishlist
          isInWishlist={isInWishlist} // THÊM: Truyền isInWishlist
          onTriggerFlyingIcon={handleTriggerFlyingIcon} // THÊM: Truyền flying icon handler
        />
      )}

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

      {/* THÊM: Flying Icon Animation */}
      <FlyingIcon
        icons={flyingIcons}
        onComplete={handleAnimationComplete}
      />
    </div>
  );
}