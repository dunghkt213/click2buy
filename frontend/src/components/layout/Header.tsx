/**
 * Header.tsx - Component Header của ứng dụng
 * Đã sửa lỗi đường dẫn import và TypeScript
 */
import {
  Bell,
  Menu,
  Search,
  ShoppingCart,
  Store
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- UI COMPONENTS ---
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

// --- FEATURE COMPONENTS ---
// Import từ ../shared và ../cart dựa trên cấu trúc thư mục của bạn
import { CartPreview } from '../cart/CartPreview';
import { AccountDropdown } from '../shared/AccountDropdown';

// --- TYPES ---
import { CartItem, User } from '../../types';

interface HeaderProps {
  // Các props bắt buộc
  cartItemsCount: number;
  unreadNotifications: number;
  onCartClick: () => void;
  onNotificationsClick: () => void;
  onFilterClick: () => void;
  onPromotionClick: () => void;
  onSupportClick: () => void;
  onStoreClick: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;

  // Các props tùy chọn (đánh dấu ?) để tránh lỗi khi cha không truyền
  wishlistItemsCount?: number;
  onWishlistClick?: () => void;
  onLogoClick?: () => void;
  user?: User;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchClick?: () => void;
  cartIconRef?: React.RefObject<HTMLButtonElement>;
  wishlistIconRef?: React.RefObject<HTMLButtonElement>;
  cartItems?: CartItem[];
  totalPrice?: number;
  hasStore?: boolean;
  onMyStoreClick?: () => void;
}

export function Header({ 
  cartItemsCount, 
  wishlistItemsCount = 0, 
  unreadNotifications,
  onCartClick, 
  onWishlistClick = () => {}, 
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
  onLogout,
  onProfileClick,
  onOrdersClick,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  onSearchClick,
  cartIconRef,
  wishlistIconRef,
  cartItems,
  totalPrice,
  hasStore,
  onMyStoreClick
}: HeaderProps) {
  const navigate = useNavigate();
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Xử lý khi nhấn Enter hoặc nút tìm kiếm
  const handleSearchSubmit = () => {
    if (externalSearchQuery.trim()) {
      if (onSearchClick) {
        onSearchClick();
      } else {
        // Mặc định điều hướng và reload trang search
        window.location.href = `/search?q=${encodeURIComponent(externalSearchQuery)}`;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Xử lý click Logo
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-card/95 backdrop-blur-md border-b border-border z-50 will-change-transform transform-gpu">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LOGO & NAV --- */}
          <div className="flex items-center gap-8">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold">Click2buy</span>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" onClick={onPromotionClick}>Khuyến mãi</Button>
              <Button variant="ghost" onClick={onSupportClick}>Hỗ trợ</Button>
            </nav>
          </div>

          {/* --- SEARCH BAR --- */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={externalSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 bg-input-background border-0 rounded-full focus-visible:ring-1"
              />
            </div>
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className="flex items-center gap-2">
            
            {/* Store Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex relative min-w-[2.5rem]"
              onClick={() => {
                if (!isLoggedIn) {
                  onLogin();
                } else {
                  onStoreClick();
                }
              }}
              title="Quản lý cửa hàng"
            >
              <Store className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex relative min-w-[2.5rem]"
                onClick={onNotificationsClick}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs pointer-events-none"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* Cart with Preview */}
            <Popover 
              open={isCartPreviewOpen} 
              onOpenChange={setIsCartPreviewOpen}
              modal={false}
            >
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative min-w-[2.5rem]"
                  onMouseEnter={() => {
                    if (cartItemsCount > 0) setIsCartPreviewOpen(true);
                  }}
                  onClick={(e: { preventDefault: () => void; }) => {
                     e.preventDefault();
                     setIsCartPreviewOpen(false);
                     onCartClick();
                  }}
                  ref={cartIconRef}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs pointer-events-none"
                    >
                      {cartItemsCount > 99 ? '99+' : cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              
              <PopoverContent 
                className="w-80 max-w-[320px] p-0 z-50 shadow-lg overflow-hidden" 
                align="end"
                sideOffset={4}
                onMouseEnter={() => setIsCartPreviewOpen(true)}
                onMouseLeave={() => setIsCartPreviewOpen(false)}
              >
                <CartPreview 
                  items={cartItems || []} 
                  totalPrice={totalPrice || 0}
                  onViewCart={() => {
                    setIsCartPreviewOpen(false);
                    onCartClick();
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Account Dropdown */}
            <AccountDropdown
              user={user}
              isLoggedIn={isLoggedIn}
              onLogin={onLogin}
              onRegister={onRegister}
              onLogout={onLogout}
              onProfileClick={onProfileClick}
              onOrdersClick={onOrdersClick}
              onNotificationsClick={onNotificationsClick}
              unreadNotifications={unreadNotifications}
            />

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden ml-2"
              onClick={onFilterClick}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={externalSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 bg-input-background border-0 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}