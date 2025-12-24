import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, CreditCard, Gift, HelpCircle, LogOut, MapPin, Package, Shield, Star, User as UserIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
export function AccountDropdown({ user, isLoggedIn, onLogin, onRegister, onLogout, onProfileClick, onOrdersClick, onNotificationsClick, unreadNotifications }) {
    const navigate = useNavigate();
    const handleSettingsClick = () => {
        navigate('/profile?tab=settings');
    };
    const getMembershipBadgeColor = (level) => {
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
        return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(UserIcon, { className: "w-4 h-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [_jsx(DropdownMenuLabel, { children: "T\u00E0i kho\u1EA3n" }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: onLogin, children: [_jsx(UserIcon, { className: "w-4 h-4 mr-2" }), "\u0110\u0103ng nh\u1EADp"] }), _jsxs(DropdownMenuItem, { onClick: onRegister, children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "\u0110\u0103ng k\u00FD"] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(HelpCircle, { className: "w-4 h-4 mr-2" }), "Tr\u1EE3 gi\u00FAp"] })] })] }));
    }
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", children: [_jsxs(Avatar, { className: "w-6 h-6", children: [_jsx(AvatarImage, { src: user?.avatar, alt: user?.name }), _jsx(AvatarFallback, { className: "text-xs", children: user?.name?.charAt(0) || 'U' })] }), _jsx("span", { className: "hidden sm:inline text-sm", children: user?.name })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-72", children: [_jsx("div", { className: "p-4 border-b border-border", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { className: "w-12 h-12", children: [_jsx(AvatarImage, { src: user?.avatar, alt: user?.name }), _jsx(AvatarFallback, { children: user?.name?.charAt(0) || 'U' })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: user?.name }), _jsx(Badge, { className: `text-xs ${getMembershipBadgeColor(user?.membershipLevel || 'Bronze')}`, children: user?.membershipLevel })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: user?.email }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(Gift, { className: "w-3 h-3 text-primary" }), _jsxs("span", { className: "text-xs text-primary font-medium", children: [user?.points || 0, " \u0111i\u1EC3m"] })] })] })] }) }), _jsxs("div", { className: "py-2", children: [_jsxs(DropdownMenuItem, { onClick: onProfileClick, children: [_jsx(UserIcon, { className: "w-4 h-4 mr-3" }), "Th\u00F4ng tin c\u00E1 nh\u00E2n"] }), _jsxs(DropdownMenuItem, { onClick: onOrdersClick, children: [_jsx(Package, { className: "w-4 h-4 mr-3" }), "\u0110\u01A1n h\u00E0ng c\u1EE7a t\u00F4i"] }), _jsxs(DropdownMenuItem, { onClick: onNotificationsClick, children: [_jsx(Bell, { className: "w-4 h-4 mr-3" }), "Th\u00F4ng b\u00E1o"] })] }), _jsx(DropdownMenuSeparator, {}), _jsxs("div", { className: "py-2", children: [_jsxs(DropdownMenuItem, { children: [_jsx(CreditCard, { className: "w-4 h-4 mr-3" }), "Ph\u01B0\u01A1ng th\u1EE9c thanh to\u00E1n"] }), _jsxs(DropdownMenuItem, { children: [_jsx(MapPin, { className: "w-4 h-4 mr-3" }), "\u0110\u1ECBa ch\u1EC9 giao h\u00E0ng"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Star, { className: "w-4 h-4 mr-3" }), "\u0110\u00E1nh gi\u00E1 c\u1EE7a t\u00F4i"] })] }), _jsx(DropdownMenuSeparator, {}), _jsxs("div", { className: "py-2", children: [_jsxs(DropdownMenuItem, { children: [_jsx(Gift, { className: "w-4 h-4 mr-3" }), "\u01AFu \u0111\u00E3i th\u00E0nh vi\u00EAn"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Shield, { className: "w-4 h-4 mr-3" }), "B\u1EA3o m\u1EADt t\u00E0i kho\u1EA3n"] }), _jsxs(DropdownMenuItem, { children: [_jsx(HelpCircle, { className: "w-4 h-4 mr-3" }), "Tr\u1EE3 gi\u00FAp & H\u1ED7 tr\u1EE3"] })] }), _jsx(DropdownMenuSeparator, {}), _jsx("div", { className: "py-2", children: _jsxs(DropdownMenuItem, { onClick: onLogout, className: "text-destructive focus:text-destructive", children: [_jsx(LogOut, { className: "w-4 h-4 mr-3" }), "\u0110\u0103ng xu\u1EA5t"] }) })] })] }));
}
