import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Menu,
  Bell
} from 'lucide-react';
import { AccountDropdown } from '../shared/AccountDropdown';
import { User, CartItem } from '../../types'; // THÊM: Import CartItem
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'; // THÊM: Import Popover
import { CartPreview } from '../modal/CartPreview'; // THÊM: Import CartPreview

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
  isLoggedIn: boolean;
  user?: User;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  searchQuery?: string; // THÊM: Query tìm kiếm
  onSearchChange?: (query: string) => void; // THÊM: Callback khi search thay đổi
  onSearchClick?: () => void; // THÊM: Callback khi click vào search input để mở modal
  cartIconRef?: React.RefObject<HTMLButtonElement>; // THÊM: Ref cho icon cart để flying animation
  wishlistIconRef?: React.RefObject<HTMLButtonElement>; // THÊM: Ref cho icon wishlist để flying animation
  cartItems?: CartItem[]; // THÊM: Danh sách items trong giỏ hàng
  totalPrice?: number; // THÊM: Tổng tiền
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
  isLoggedIn,
  user,
  onLogin,
  onRegister,
  onLogout,
  onProfileClick,
  onOrdersClick,
  searchQuery: externalSearchQuery = '', // THÊM: Nhận search query từ parent
  onSearchChange, // THÊM: Nhận callback từ parent
  onSearchClick, // THÊM: Callback để mở search modal
  cartIconRef, // THÊM: Nhận ref từ parent
  wishlistIconRef, // THÊM: Nhận ref từ parent
  cartItems, // THÊM: Nhận danh sách items từ parent
  totalPrice // THÊM: Nhận tổng tiền từ parent
}: HeaderProps) {
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false); // THÊM: State cho cart preview

  // Handler khi search thay đổi - cho phép nhập text
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  // Handler khi submit search (chỉ khi nhấn Enter)
  const handleSearchSubmit = () => {
    if (externalSearchQuery.trim()) {
      onSearchClick?.();
    }
  };

  // Handler khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <header className="fixed top-0 w-full bg-card/95 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold">Click2buy</span>
            </div>

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
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex relative"
              onClick={onNotificationsClick}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Badge>
              )}
            </Button>
            
            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex relative"
              onClick={onWishlistClick}
              ref={wishlistIconRef}
            >
              <Heart className="w-4 h-4" />
              {wishlistItemsCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-primary/10 text-primary"
                >
                  {wishlistItemsCount > 99 ? '99+' : wishlistItemsCount}
                </Badge>
              )}
            </Button>

            {/* Cart */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCartPreviewOpen(true)}
              onMouseLeave={() => setIsCartPreviewOpen(false)}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={onCartClick}
                ref={cartIconRef}
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </Badge>
                )}
              </Button>

              {/* Hover Preview */}
              {isCartPreviewOpen && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <CartPreview 
                    items={cartItems || []} 
                    totalPrice={totalPrice || 0}
                    onViewCart={() => {
                      setIsCartPreviewOpen(false);
                      onCartClick();
                    }}
                  />
                </div>
              )}
            </div>

            {/* Account */}
            <AccountDropdown
              user={user}
              isLoggedIn={isLoggedIn}
              onLogin={onLogin}
              onRegister={onRegister}
              onLogout={onLogout}
              onProfileClick={onProfileClick}
              onOrdersClick={onOrdersClick}
              onWishlistClick={onWishlistClick}
              onNotificationsClick={onNotificationsClick}
              unreadNotifications={unreadNotifications}
            />

            {/* Mobile Menu */}
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

        {/* Mobile search - Chỉ Enter mới trigger tìm kiếm */}
        <div className="md:hidden pb-4">
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
      </div>
    </header>
  );
}