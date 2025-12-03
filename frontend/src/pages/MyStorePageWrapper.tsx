/**
 * MyStorePageWrapper - Wrapper cho My Store page với Header và Footer
 */

import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { MyStorePage } from '../components/store/MyStorePage';
import { Order, StoreProduct, User } from '../types/interface';

interface MyStorePageWrapperProps {
  storeProducts: StoreProduct[];
  storeOrders: Order[];
  onAddProduct: (productFormData: any) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<StoreProduct>) => void;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  // Header props
  cartItemsCount: number;
  unreadNotifications: number;
  onCartClick: () => void;
  onNotificationsClick: () => void;
  onFilterClick: () => void;
  onPromotionClick: () => void;
  onSupportClick: () => void;
  onStoreClick: () => void;
  onLogoClick: () => void;
  isLoggedIn: boolean;
  user?: User;
  onLogin: () => void;
  onRegister: () => void;
  cartItems: any[];
  totalPrice: number;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClick: () => void;
  cartIconRef: React.RefObject<HTMLButtonElement>;
}

export function MyStorePageWrapper(props: MyStorePageWrapperProps) {
  const {
    storeProducts,
    storeOrders,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onUpdateOrderStatus,
    cartItemsCount,
    unreadNotifications,
    onCartClick,
    onNotificationsClick,
    onFilterClick,
    onPromotionClick,
    onSupportClick,
    onStoreClick,
    onLogoClick,
    isLoggedIn,
    user,
    onLogin,
    onRegister,
    cartItems,
    totalPrice,
    onLogout,
    onProfileClick,
    onOrdersClick,
    searchQuery,
    onSearchChange,
    onSearchClick,
    cartIconRef,
  } = props;

  return (
    <>
      <Header
        cartItemsCount={cartItemsCount}
        unreadNotifications={unreadNotifications}
        onCartClick={onCartClick}
        onNotificationsClick={onNotificationsClick}
        onFilterClick={onFilterClick}
        onPromotionClick={onPromotionClick}
        onSupportClick={onSupportClick}
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
      <main className="pt-16 min-h-screen">
        <MyStorePage
          storeProducts={storeProducts}
          storeOrders={storeOrders}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onUpdateOrderStatus={onUpdateOrderStatus}
        />
      </main>
      <Footer />
    </>
  );
}

