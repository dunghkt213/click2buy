/**
 * SearchPage - Trang tìm kiếm
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchModal } from '../../components/search/SearchModal';
import { useAppContext } from '../../providers/AppProvider';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const app = useAppContext();
  const [isOpen, setIsOpen] = useState(true);
  const searchQuery = searchParams.get('q') || '';
  const mode = searchParams.get('mode') || 'text';
  const imageSearchDataUrl = mode === 'image' ? sessionStorage.getItem('c2b.imageSearch.image') || '' : '';

  useEffect(() => {
    setIsOpen(true);
    // Reload lại khi search query thay đổi
    console.log('🔄 [SearchPage] Search query thay đổi:', searchQuery);
  }, [searchQuery, mode]);

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
      initialSearchMode={mode === 'image' ? 'image' : 'text'}
      initialImageSearch={imageSearchDataUrl}
      cartItemsCount={app.getTotalItems()}
      unreadNotifications={app.notifications.getUnreadCount()}
      onCartClick={() => navigate('/cart')}
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
      onTriggerFlyingIcon={app.handleTriggerFlyingIcon}
      onLogoClick={() => navigate('/feed')}
      onStoreClick={app.handleStoreClick}
      cartItems={app.cartItems}
      totalPrice={app.getTotalPrice()}
      cartIconRef={app.cartIconRef}
      flyingIcons={app.flyingIcons}
      onAnimationComplete={app.handleAnimationComplete}
    />
  );
}

