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
import { User } from '../../types';

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
  onOrdersClick
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
              <span className="text-xl font-semibold">ShopMart</span>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Button variant="ghost" onClick={onPromotionClick}>Khuyến mãi</Button>
              <Button variant="ghost" onClick={onSupportClick}>Hỗ trợ</Button>
            </nav>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={onCartClick}
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

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-input-background border-0 rounded-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}