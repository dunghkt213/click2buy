import { AnimatePresence, motion, useInView } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
// Layout Components
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Hero } from './components/layout/Hero';

// Shared Components  
import {
  ProductGrid
} from './components/product';
import {
  CheckoutModal
} from './components/search';
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
import { AuthCallback, AuthModal } from './components/auth';

// Search Components
import { SearchModal } from './components/search/SearchModal';

// Product Detail Modal
import { ProductDetailModal } from './components/review/ProductDetailModal';

// Flying Icon
import { FlyingIcon, FlyingIconConfig } from './components/animation/FlyingIcon';

// Pages
import { CartPage } from './pages/CartPage';
import { MyStorePage } from './pages/MyStorePage';
import { OrdersPage } from './pages/OrdersPage';

// Store Registration Modal
import { StoreRegistrationModal } from './components/store/StoreRegistrationModal';

// Hot Deals Section
import { HotDealsSection } from './components/product/HotDealsSection';

// Hooks
import { useNotifications, useWishlist } from './hooks';
import { useCartApi } from './hooks/useCartApi';

// API
import { productApi } from './apis/product';
import { normalizeUser, userApi } from './apis/user';

// Types & Data
import { toast } from 'sonner';
import { authApi, authStorage, AuthSuccessPayload } from './apis/auth';
import { mapOrderResponse, orderApi } from './apis/order';
import {
  initialFAQs,
  initialNotifications,
  initialPromotions,
  initialSupportTickets,
} from './constants/mockData';
import { FAQItem, FilterState, Order, Promotion, StoreInfo, StoreProduct, SupportTicket, User } from './types';
import { generateTicketId } from './utils/utils';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // State cho my store page
  const [isMyStorePageOpen, setIsMyStorePageOpen] = useState(false);

  // State cho store registration modal
  const [isStoreRegistrationOpen, setIsStoreRegistrationOpen] = useState(false);
  
  // State cho store
  const [hasStore, setHasStore] = useState(false); // User chưa có store
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);

  // Custom hooks - Sử dụng useCartApi để kết nối với backend
  const {
    cartItems,
    loading: cartLoading,
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
  } = useCartApi();
  
  // Wrapper cho addToCart để tương thích với interface hiện tại
  const addToCart = async (product: any) => {
    // Lấy sellerId từ product (ownerId từ backend)
    const sellerId = product.sellerId || product.ownerId || product.userId;
    
    console.log('Add to cart - Product:', product);
    console.log('Add to cart - SellerId:', sellerId);
    
    if (!sellerId) {
      toast.error('Không tìm thấy thông tin người bán. Vui lòng thử lại.');
      console.error('Product missing sellerId/ownerId:', product);
      return;
    }
    
    try {
      await addToCartApi(product, sellerId);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      // Error đã được xử lý trong useCartApi
    }
  };
  
  const removeFromCart = async (productId: string) => {
    // useCartApi sẽ tự động tìm sellerId từ cartItems
    await removeFromCartApi(productId);
  };
  
  const updateQuantity = async (productId: string, quantity: number) => {
    // useCartApi sẽ tự động tìm sellerId từ cartItems
    await updateQuantityApi(productId, quantity);
  };

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
  const [user, setUser] = useState<User | undefined>(() => authStorage.getUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!(authStorage.getUser() && authStorage.getToken()));
  const [showAuthCallback, setShowAuthCallback] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 50000000],
    brands: [],
    rating: 0,
    inStock: true,
  });

  // Check for OAuth callback URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Check if we're on /auth/callback path
    if (window.location.pathname === '/auth/callback' || token) {
      setShowAuthCallback(true);
    }
  }, []);

  // Fetch user info từ API khi component mount nếu user đã đăng nhập
  useEffect(() => {
    const fetchUserInfoOnMount = async () => {
      if (isLoggedIn && user?.id) {
        try {
          const backendUser = await userApi.findOne(user.id);
          const fullUserInfo = normalizeUser(backendUser);
          setUser(fullUserInfo);
          
          // Nếu role là seller, tự động set hasStore = true
          if (fullUserInfo.role === 'seller') {
            setHasStore(true);
          }
        } catch (error) {
          console.error('Failed to fetch user info on mount:', error);
        }
      }
    };

    fetchUserInfoOnMount();
  }, [isLoggedIn, user?.id]);

  // Load seller products từ API khi mở My Store page
  useEffect(() => {
    const loadSellerProducts = async () => {
      if (isMyStorePageOpen && isLoggedIn && user?.role === 'seller') {
        console.log('🛒 [My Store] Bắt đầu load seller products...');
        console.log('🛒 [My Store] User info:', { id: user?.id, role: user?.role, isLoggedIn });
        console.log('🛒 [My Store] Token:', authStorage.getToken() ? 'Có token' : 'Không có token');
        
        try {
          const products = await productApi.getAllBySeller();
          console.log('✅ [My Store] Load seller products thành công:', products);
          console.log(`📦 [My Store] Tổng số sản phẩm: ${products.length}`);
          
          if (products.length === 0) {
            console.warn('⚠️ [My Store] Không có sản phẩm nào được trả về từ API');
            toast.info('Bạn chưa có sản phẩm nào trong cửa hàng. Hãy thêm sản phẩm mới!');
          } else {
            toast.success(`Đã tải ${products.length} sản phẩm từ cửa hàng của bạn`);
          }
          
          setStoreProducts(products);
          
          // Cập nhật storeInfo với totalProducts
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: products.length
            });
          }
        } catch (error: any) {
          console.error('❌ [My Store] Failed to load seller products:', error);
          console.error('❌ [My Store] Error details:', {
            message: error.message,
            status: error.status,
            data: error.data
          });
          
          // Hiển thị error message chi tiết
          if (error.status === 401) {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (error.status === 404) {
            console.log('ℹ️ [My Store] Không tìm thấy sản phẩm (404) - có thể chưa có sản phẩm');
            setStoreProducts([]); // Set empty array
          } else {
            toast.error(error.message || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
          }
        }
      } else {
        console.log('⏭️ [My Store] Bỏ qua load - điều kiện không đủ:', {
          isMyStorePageOpen,
          isLoggedIn,
          userRole: user?.role
        });
      }
    };

    loadSellerProducts();
  }, [isMyStorePageOpen, isLoggedIn, user?.role, user?.id]);

  // Account functions
  const handleLogin = () => {
    setAuthTab('login');
    setIsAuthOpen(true);
  };

  const handleRegister = () => {
    setAuthTab('register');
    setIsAuthOpen(true);
  };

  // Hàm fetch user info từ API và cập nhật state
  const fetchAndUpdateUserInfo = async (userId: string) => {
    try {
      const backendUser = await userApi.findOne(userId);
      const fullUserInfo = normalizeUser(backendUser);
      setUser(fullUserInfo);
      // Cập nhật lại user trong authStorage với đầy đủ thông tin
      const token = authStorage.getToken();
      if (token) {
        authStorage.save(fullUserInfo, token);
      }
      
      // Nếu role là seller, tự động set hasStore = true
      if (fullUserInfo.role === 'seller') {
        setHasStore(true);
      }
      
      return fullUserInfo;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  };

  const handleLoginSuccess = async ({ user: userData, accessToken }: AuthSuccessPayload) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, accessToken);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
    
    // Reload trang sau khi đăng nhập thành công
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleRegisterSuccess = async ({ user: userData, accessToken }: AuthSuccessPayload) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, accessToken);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
    
    // Reload trang sau khi đăng ký thành công
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleAuthCallbackSuccess = async (userData: User, token: string) => {
    setIsLoggedIn(true);
    setUser(userData);
    authStorage.save(userData, token);
    setShowAuthCallback(false);
    
    // Fetch đầy đủ thông tin user từ API (bao gồm role)
    if (userData.id) {
      await fetchAndUpdateUserInfo(userData.id);
    }
    
    // Clear URL params và reload trang
    window.history.replaceState({}, '', '/');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Failed to logout from API', error);
    } finally {
      authStorage.clear();
      setIsLoggedIn(false);
      setUser(undefined);
      // Reload trang sau khi đăng xuất
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleOrdersClick = async () => {
    setIsOrdersPageOpen(true);
    // Load orders từ API khi mở orders page
    if (isLoggedIn) {
      try {
        setLoadingOrders(true);
        // Lưu ý: Backend có thể có API để lấy orders của user, hiện tại dùng getAllForSeller
        // Cần kiểm tra backend có API /orders/user không
        const backendOrders = await orderApi.getAllForSeller();
        const mappedOrders = backendOrders.map(mapOrderResponse);
        setOrders(mappedOrders);
      } catch (error: any) {
        console.error('Failed to load orders:', error);
        toast.error('Không thể tải danh sách đơn hàng');
      } finally {
        setLoadingOrders(false);
      }
    }
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
  const handleCheckout = async (checkoutData: any) => {
    try {
      // Transform checkoutData thành format của orderApi
      const orderDto = {
        items: checkoutData.items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          sellerId: (item as any).sellerId || 'default-seller', // Cần sellerId từ product
        })),
        shippingAddress: {
          name: checkoutData.shippingAddress.name,
          phone: checkoutData.shippingAddress.phone,
          address: checkoutData.shippingAddress.address,
          ward: checkoutData.shippingAddress.ward,
          district: checkoutData.shippingAddress.district,
          city: checkoutData.shippingAddress.city,
        },
        paymentMethod: checkoutData.paymentMethod.type,
        shippingMethod: checkoutData.shippingMethod?.name || 'standard',
        note: checkoutData.note,
      };
      
      const newOrder = await orderApi.create(orderDto);
      const mappedOrder = mapOrderResponse(newOrder);
      
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ShopMart.');
      
      // Xóa các items đã checkout khỏi giỏ hàng
      const selectedItems = getSelectedItems();
      for (const item of selectedItems) {
        // removeFromCartApi sẽ tự động tìm sellerId từ cartItems
        await removeFromCartApi(item.id);
      }
      
      // Refresh cart để cập nhật UI
      await refreshCart();
      
      // Đóng checkout modal
      setIsCheckoutOpen(false);
      
      // Có thể redirect đến orders page hoặc order detail
      setIsOrdersPageOpen(true);
      setOrders(prev => [mappedOrder, ...prev]);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
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
    // Kiểm tra role: nếu là seller thì không cần đăng ký, mở trực tiếp cửa hàng
    if (user?.role === 'seller') {
      setIsMyStorePageOpen(true);
      // Nếu chưa có store info, set hasStore = true để có thể sử dụng
      if (!hasStore) {
        setHasStore(true);
      }
      return;
    }
    
    // Nếu là customer hoặc chưa có role, kiểm tra hasStore
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

  const handleAddProduct = async (productFormData: {
    name: string;
    description: string;
    price: number;
    salePrice: number;
    stock: number;
    brand: string;
    condition: 'new' | 'used';
    categoryIds: string[];
    tags: string[];
    images: string[];
    attributes: Record<string, any>;
    variants: Record<string, any>;
    warehouseAddress: {
      line1: string;
      city: string;
      province: string;
      country: string;
      postalCode: string;
    };
    isActive: boolean;
  }) => {
    try {
      // Chuẩn bị warehouseAddress - chỉ gửi các field có giá trị
      const warehouseAddress: any = {
        line1: productFormData.warehouseAddress.line1,
        city: productFormData.warehouseAddress.city,
      };
      if (productFormData.warehouseAddress.province) {
        warehouseAddress.province = productFormData.warehouseAddress.province;
      }
      if (productFormData.warehouseAddress.country) {
        warehouseAddress.country = productFormData.warehouseAddress.country;
      }
      if (productFormData.warehouseAddress.postalCode) {
        warehouseAddress.postalCode = productFormData.warehouseAddress.postalCode;
      }

      // Gọi API POST product với đầy đủ thông tin
      const createdProduct = await productApi.create({
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
      });

      // Map response từ API về StoreProduct format để hiển thị trong UI
      // createdProduct.price đã được map từ salePrice nếu có, nếu không thì là price
      // createdProduct.originalPrice là giá gốc (chỉ có khi có salePrice)
      const newProduct: StoreProduct = {
        id: createdProduct.id,
        name: createdProduct.name,
        price: createdProduct.price, // Giá bán (đã ưu tiên salePrice trong mapProductResponse)
        originalPrice: createdProduct.originalPrice || (productFormData.salePrice > 0 ? productFormData.price : undefined),
        stock: productFormData.stock,
        sold: 0,
        image: createdProduct.image,
        images: createdProduct.images || [],
        category: productFormData.categoryIds.join(', ') || createdProduct.category,
        description: createdProduct.description,
        status: productFormData.isActive ? 'active' : 'inactive',
        createdAt: new Date().toISOString(),
        rating: 0,
        reviews: 0,
      };

      setStoreProducts(prev => [newProduct, ...prev]);
      
      if (storeInfo) {
        setStoreInfo({
          ...storeInfo,
          totalProducts: storeProducts.length + 1
        });
      }
      
      toast.success('Sản phẩm đã được thêm thành công!');
      
      // Reload seller products từ API để cập nhật danh sách
      if (isMyStorePageOpen && user?.role === 'seller') {
        try {
          const products = await productApi.getAllBySeller();
          setStoreProducts(products);
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: products.length
            });
          }
        } catch (err) {
          console.error('Failed to reload seller products:', err);
        }
      }
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleUpdateProduct = (id: string, updates: Partial<StoreProduct>) => {
    setStoreProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates }
        : product
    ));
    alert('Sản phẩm đã được cập nhật!');
  };

  const handleDeleteProduct = async (id: string) => {
    // Hiển thị confirmation dialog
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.');
    
    if (!confirmed) {
      console.log('❌ [My Store] Người dùng hủy xóa sản phẩm');
      return;
    }
    
    console.log(`🗑️ [My Store] Bắt đầu xóa sản phẩm với ID: ${id}`);
    
    try {
      // Gọi API xóa sản phẩm
      const result = await productApi.remove(id);
      console.log('✅ [My Store] Xóa sản phẩm thành công:', result);
      
      // Reload seller products từ API để cập nhật danh sách
      if (isMyStorePageOpen && user?.role === 'seller') {
        try {
          console.log('🔄 [My Store] Reload danh sách sản phẩm sau khi xóa...');
          const products = await productApi.getAllBySeller();
          setStoreProducts(products);
          
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: products.length
            });
          }
          
          console.log(`✅ [My Store] Đã reload ${products.length} sản phẩm`);
        } catch (err: any) {
          console.error('❌ [My Store] Failed to reload seller products:', err);
          // Vẫn xóa khỏi local state nếu reload thất bại
          setStoreProducts(prev => prev.filter(product => product.id !== id));
          if (storeInfo) {
            setStoreInfo({
              ...storeInfo,
              totalProducts: storeProducts.length - 1
            });
          }
        }
      } else {
        // Nếu không phải My Store page, chỉ xóa khỏi state
        setStoreProducts(prev => prev.filter(product => product.id !== id));
        if (storeInfo) {
          setStoreInfo({
            ...storeInfo,
            totalProducts: storeProducts.length - 1
          });
        }
      }
      
      toast.success(result.message || 'Sản phẩm đã được xóa thành công!');
    } catch (error: any) {
      console.error('❌ [My Store] Failed to delete product:', error);
      console.error('❌ [My Store] Error details:', {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      if (error.status === 403) {
        toast.error('Bạn không có quyền xóa sản phẩm này.');
      } else if (error.status === 404) {
        toast.error('Không tìm thấy sản phẩm để xóa.');
      } else if (error.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(error.message || 'Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    }
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
      cartItems={cartItems}
      totalPrice={getTotalPrice()}
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
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
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
                  isLoggedIn={isLoggedIn}
                  onLogin={handleLogin}
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

      {showAuthCallback && (
        <AuthCallback onSuccess={handleAuthCallbackSuccess} />
      )}

      <ProductDetailModal
        isOpen={isProductDetailOpen}
        onClose={() => setIsProductDetailOpen(false)}
        product={selectedProduct}
        onAddToCart={addToCart}
        onAddToWishlist={addToWishlist}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
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