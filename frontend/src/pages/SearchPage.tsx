/**
 * SearchPage - Trang tìm kiếm
 */

import { SearchModal } from '../components/search/SearchModal';
import { Product, User } from '../types/interface';

interface SearchPageProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onAddToCart: (product: Product) => Promise<void>;
  cartItemsCount: number;
  wishlistItemsCount: number;
  unreadNotifications: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onNotificationsClick: () => void;
  onPromotionClick: () => void;
  onSupportClick: () => void;
  isLoggedIn: boolean;
  user?: User;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onViewDetail: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  onTriggerFlyingIcon: (type: 'heart' | 'cart', element: HTMLElement) => void;
}

export function SearchPage({
  isOpen,
  onClose,
  searchQuery,
  onAddToCart,
  cartItemsCount,
  wishlistItemsCount,
  unreadNotifications,
  onCartClick,
  onWishlistClick,
  onNotificationsClick,
  onPromotionClick,
  onSupportClick,
  isLoggedIn,
  user,
  onLogin,
  onRegister,
  onLogout,
  onProfileClick,
  onOrdersClick,
  onViewDetail,
  onAddToWishlist,
  isInWishlist,
  onTriggerFlyingIcon,
}: SearchPageProps) {
  return (
    <SearchModal
      isOpen={isOpen}
      onClose={onClose}
      onAddToCart={onAddToCart}
      initialSearchQuery={searchQuery}
      cartItemsCount={cartItemsCount}
      wishlistItemsCount={wishlistItemsCount}
      unreadNotifications={unreadNotifications}
      onCartClick={onCartClick}
      onWishlistClick={onWishlistClick}
      onNotificationsClick={onNotificationsClick}
      onPromotionClick={onPromotionClick}
      onSupportClick={onSupportClick}
      isLoggedIn={isLoggedIn}
      user={user}
      onLogin={onLogin}
      onRegister={onRegister}
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      onOrdersClick={onOrdersClick}
      onViewDetail={onViewDetail}
      onAddToWishlist={onAddToWishlist}
      isInWishlist={isInWishlist}
      onTriggerFlyingIcon={onTriggerFlyingIcon}
    />
  );
}

