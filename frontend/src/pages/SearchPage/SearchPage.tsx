/**
 * SearchPage - Trang tìm kiếm
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchModal } from '../../components/search/SearchModal';
import { useAppContext } from '../../providers/AppProvider';
import { useEffect, useState } from 'react';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const app = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    navigate(-1);
  };

  return (
    <SearchModal
      isOpen={isOpen}
      onClose={handleClose}
      onAddToCart={app.addToCart}
      initialSearchQuery={searchQuery}
      cartItemsCount={app.getTotalItems()}
      wishlistItemsCount={app.wishlistItems.length}
      unreadNotifications={app.notifications.getUnreadCount()}
      onCartClick={() => navigate('/cart')}
      onWishlistClick={() => app.sidebars.openWishlist()}
      onNotificationsClick={() => app.sidebars.openNotification()}
      onPromotionClick={() => app.sidebars.openPromotion()}
      onSupportClick={() => app.sidebars.openSupport()}
      isLoggedIn={app.isLoggedIn}
      user={app.user}
      onLogin={app.handleLogin}
      onRegister={app.handleRegister}
      onLogout={app.handleLogout}
      onProfileClick={() => navigate('/profile')}
      onOrdersClick={() => navigate('/orders')}
      onViewDetail={app.handleViewProductDetail}
      onAddToWishlist={app.addToWishlist}
      isInWishlist={app.isInWishlist}
      onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
      onLogoClick={() => navigate('/feed')}
      onStoreClick={app.handleStoreClick}
      cartItems={app.cartItems}
      totalPrice={app.getTotalPrice()}
      cartIconRef={app.cartIconRef}
      wishlistIconRef={app.wishlistIconRef}
      flyingIcons={app.flyingIcons}
      onAnimationComplete={app.handleAnimationComplete}
    />
  );
}

