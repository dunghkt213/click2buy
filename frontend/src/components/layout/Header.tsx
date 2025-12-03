import {
  Bell,
  Heart,
  Search,
  ShoppingCart,
  Store
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, User } from '../../types';
import { CartPreview } from '../cart/CartPreview';
import { AccountDropdown } from '../shared/AccountDropdown';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface HeaderProps {
  cartItemsCount: number;
  wishlistItemsCount: number;
  unreadNotifications: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onNotificationsClick: () => void;
  onFilterClick: () => void;
  onPromotionClick: () => void;
  onSupportClick: () => void;
  onStoreClick: () => void;
  onLogoClick?: () => void;
  isLoggedIn: boolean;
  user?: User;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchClick?: () => void;
  cartIconRef?: React.RefObject<HTMLButtonElement>;
  wishlistIconRef?: React.RefObject<HTMLButtonElement>;
  cartItems?: CartItem[];
  totalPrice?: number;
}

export function Header({ 
  cartItemsCount, 
  wishlistItemsCount,
  unreadNotifications,
  onCartClick, 
  onWishlistClick,
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
  totalPrice
}: HeaderProps) {
  const navigate = useNavigate();
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);

  // Handler khi search thay đổi - cho phép nhập text
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  // Handler khi submit search (chỉ khi nhấn Enter)
  const handleSearchSubmit = () => {
    if (externalSearchQuery.trim()) {
      if (onSearchClick) {
        onSearchClick();
      } else {
        // Fallback: navigate to search page
        navigate(`/search?q=${encodeURIComponent(externalSearchQuery)}`);
      }
    }
  };

  // Handler khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handler logo click - navigate to home
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/feed');
    }
  };

  return (
    <header className="fixed top-0 w-full bg-card/95 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" onClick={onPromotionClick}>Khuyến mãi</Button>
              <Button variant="ghost" onClick={onSupportClick}>Hỗ trợ</Button>
            </nav>
          </div>

          {/* Search - Chỉ Enter mới trigger tìm kiếm */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
              />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={externalSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 bg-input-background border-0 rounded-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Store */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex relative"
              onClick={() => {
                if (!isLoggedIn) {
                  onLogin();
                } else {
                  onStoreClick();
                }
              }}
            >
              <Store className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <div 
              className="relative"
              onMouseEnter={() => {
                // Mở preview khi hover
                if (cartItemsCount > 0) {
                  setIsCartPreviewOpen(true);
                }
              }}
              onMouseLeave={() => {
                // Đóng preview khi rời chuột
                setIsCartPreviewOpen(false);
              }}
            >
              <Popover open={isCartPreviewOpen} onOpenChange={setIsCartPreviewOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    ref={cartIconRef}
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    onClick={(e) => {
                      // Click vào cart icon: navigate đến cart page
                      e.preventDefault();
                      e.stopPropagation();
                      setIsCartPreviewOpen(false);
                      navigate('/cart');
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemsCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs cursor-pointer"
                        onClick={(e) => {
                          // Click vào badge: navigate đến cart page
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCartPreviewOpen(false);
                          navigate('/cart');
                        }}
                      >
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0" 
                  align="end"
                  onMouseEnter={() => setIsCartPreviewOpen(true)}
                  onMouseLeave={() => setIsCartPreviewOpen(false)}
                >
                  <CartPreview 
                    items={cartItems || []}
                    totalPrice={totalPrice || 0}
                    onViewCart={() => {
                      setIsCartPreviewOpen(false);
                      navigate('/cart');
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Wishlist */}
            <Button 
              ref={wishlistIconRef}
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onWishlistClick}
            >
              <Heart className="h-5 w-5" />
              {wishlistItemsCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {wishlistItemsCount}
                </Badge>
              )}
            </Button>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Account */}
            <AccountDropdown
              isLoggedIn={isLoggedIn}
              user={user}
              onLogin={onLogin}
              onRegister={onRegister}
              onLogout={onLogout}
              onProfileClick={onProfileClick}
              onOrdersClick={onOrdersClick}
              onWishlistClick={onWishlistClick}
              onNotificationsClick={onNotificationsClick}
              unreadNotifications={unreadNotifications}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
