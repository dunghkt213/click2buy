import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  User as UserIcon, 
  Settings, 
  Package, 
  Heart, 
  Bell, 
  HelpCircle, 
  LogOut, 
  CreditCard,
  MapPin,
  Star,
  Gift,
  Shield,
  Users
} from 'lucide-react';
import { User } from 'types';

interface AccountDropdownProps {
  user?: User;
  isLoggedIn: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onOrdersClick: () => void;
  onWishlistClick: () => void;
  onNotificationsClick: () => void;
  unreadNotifications: number;
}

export function AccountDropdown({
  user,
  isLoggedIn,
  onLogin,
  onRegister,
  onLogout,
  onProfileClick,
  onOrdersClick,
  onWishlistClick,
  onNotificationsClick,
  unreadNotifications
}: AccountDropdownProps) {
  const getMembershipBadgeColor = (level: string) => {
    switch (level) {
      case 'Bronze':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <UserIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogin}>
            <UserIcon className="w-4 h-4 mr-2" />
            Đăng nhập
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRegister}>
            <Users className="w-4 h-4 mr-2" />
            Đăng ký
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <HelpCircle className="w-4 h-4 mr-2" />
            Trợ giúp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{user?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{user?.name}</p>
                <Badge className={`text-xs ${getMembershipBadgeColor(user?.membershipLevel || 'Bronze')}`}>
                  {user?.membershipLevel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">{user?.points || 0} điểm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem onClick={onProfileClick}>
            <UserIcon className="w-4 h-4 mr-3" />
            Thông tin cá nhân
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onOrdersClick}>
            <Package className="w-4 h-4 mr-3" />
            Đơn hàng của tôi
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onWishlistClick}>
            <Heart className="w-4 h-4 mr-3" />
            Danh sách yêu thích
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={onNotificationsClick}>
            <div className="flex items-center w-full">
              <Bell className="w-4 h-4 mr-3" />
              <span className="flex-1">Thông báo</span>
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-2">
          <DropdownMenuItem>
            <CreditCard className="w-4 h-4 mr-3" />
            Phương thức thanh toán
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <MapPin className="w-4 h-4 mr-3" />
            Địa chỉ giao hàng
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Star className="w-4 h-4 mr-3" />
            Đánh giá của tôi
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-2">
          <DropdownMenuItem>
            <Gift className="w-4 h-4 mr-3" />
            Ưu đãi thành viên
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Shield className="w-4 h-4 mr-3" />
            Bảo mật tài khoản
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Settings className="w-4 h-4 mr-3" />
            Cài đặt
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <HelpCircle className="w-4 h-4 mr-3" />
            Trợ giúp & Hỗ trợ
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="py-2">
          <DropdownMenuItem 
            onClick={onLogout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Đăng xuất
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}