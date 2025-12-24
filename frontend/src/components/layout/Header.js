import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Header.tsx - Component Header của ứng dụng
 * Đã sửa lỗi đường dẫn import và TypeScript
 */
import { Bell, Menu, Search, ShoppingCart, Store } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- UI COMPONENTS ---
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger, } from '../ui/popover';
// --- FEATURE COMPONENTS ---
// Import từ ../shared và ../cart dựa trên cấu trúc thư mục của bạn
import { CartPreview } from '../cart/CartPreview';
import { AccountDropdown } from '../shared/AccountDropdown';
export function Header({ cartItemsCount, wishlistItemsCount = 0, unreadNotifications, onCartClick, onWishlistClick = () => { }, onNotificationsClick, onFilterClick, onPromotionClick, onSupportClick, onStoreClick, onLogoClick, isLoggedIn, user, onLogin, onRegister, onLogout, onProfileClick, onOrdersClick, searchQuery: externalSearchQuery = '', onSearchChange, onSearchClick, cartIconRef, wishlistIconRef, cartItems, totalPrice, hasStore, onMyStoreClick }) {
    const navigate = useNavigate();
    const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
    // Xử lý thay đổi ô tìm kiếm
    const handleSearchChange = (value) => {
        if (onSearchChange) {
            onSearchChange(value);
        }
    };
    // Xử lý khi nhấn Enter hoặc nút tìm kiếm
    const handleSearchSubmit = () => {
        if (externalSearchQuery.trim()) {
            if (onSearchClick) {
                onSearchClick();
            }
            else {
                // Mặc định điều hướng và reload trang search
                window.location.href = `/search?q=${encodeURIComponent(externalSearchQuery)}`;
            }
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };
    // Xử lý click Logo
    const handleLogoClick = () => {
        if (onLogoClick) {
            onLogoClick();
        }
        else {
            navigate('/');
        }
    };
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 w-full bg-card/95 backdrop-blur-md border-b border-border z-50 will-change-transform transform-gpu", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center gap-8", children: [_jsxs("button", { onClick: handleLogoClick, className: "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center", children: _jsx("div", { className: "w-4 h-4 bg-primary-foreground rounded-sm" }) }), _jsx("span", { className: "text-xl font-semibold", children: "Click2buy" })] }), _jsxs("nav", { className: "hidden lg:flex items-center gap-6", children: [_jsx(Button, { variant: "ghost", onClick: onPromotionClick, children: "Khuy\u1EBFn m\u00E3i" }), _jsx(Button, { variant: "ghost", onClick: onSupportClick, children: "H\u1ED7 tr\u1EE3" })] })] }), _jsx("div", { className: "flex-1 max-w-xl mx-8 hidden md:block", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm ki\u1EBFm s\u1EA3n ph\u1EA9m...", value: externalSearchQuery, onChange: (e) => handleSearchChange(e.target.value), onKeyDown: handleKeyDown, className: "pl-10 pr-4 bg-input-background border-0 rounded-full focus-visible:ring-1" })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "hidden md:flex relative min-w-[2.5rem]", onClick: () => {
                                        if (!isLoggedIn) {
                                            onLogin();
                                        }
                                        else {
                                            onStoreClick();
                                        }
                                    }, title: "Qu\u1EA3n l\u00FD c\u1EEDa h\u00E0ng", children: _jsx(Store, { className: "w-4 h-4" }) }), isLoggedIn && (_jsxs(Button, { variant: "ghost", size: "sm", className: "hidden md:flex relative min-w-[2.5rem]", onClick: onNotificationsClick, children: [_jsx(Bell, { className: "w-4 h-4" }), unreadNotifications > 0 && (_jsx(Badge, { variant: "destructive", className: "absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs pointer-events-none", children: unreadNotifications > 99 ? '99+' : unreadNotifications }))] })), _jsxs(Popover, { open: isCartPreviewOpen, onOpenChange: setIsCartPreviewOpen, modal: false, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "relative min-w-[2.5rem]", onMouseEnter: () => {
                                                    if (cartItemsCount > 0)
                                                        setIsCartPreviewOpen(true);
                                                }, onClick: (e) => {
                                                    e.preventDefault();
                                                    setIsCartPreviewOpen(false);
                                                    onCartClick();
                                                }, ref: cartIconRef, children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), cartItemsCount > 0 && (_jsx(Badge, { variant: "destructive", className: "absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs pointer-events-none", children: cartItemsCount > 99 ? '99+' : cartItemsCount }))] }) }), _jsx(PopoverContent, { className: "w-80 max-w-[320px] p-0 z-50 shadow-lg overflow-hidden", align: "end", sideOffset: 4, onMouseEnter: () => setIsCartPreviewOpen(true), onMouseLeave: () => setIsCartPreviewOpen(false), children: _jsx(CartPreview, { items: cartItems || [], totalPrice: totalPrice || 0, onViewCart: () => {
                                                    setIsCartPreviewOpen(false);
                                                    onCartClick();
                                                } }) })] }), _jsx(AccountDropdown, { user: user, isLoggedIn: isLoggedIn, onLogin: onLogin, onRegister: onRegister, onLogout: onLogout, onProfileClick: onProfileClick, onOrdersClick: onOrdersClick, onNotificationsClick: onNotificationsClick, unreadNotifications: unreadNotifications }), _jsx(Button, { variant: "ghost", size: "sm", className: "lg:hidden ml-2", onClick: onFilterClick, children: _jsx(Menu, { className: "w-4 h-4" }) })] })] }), _jsx("div", { className: "md:hidden pb-4", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm ki\u1EBFm s\u1EA3n ph\u1EA9m...", value: externalSearchQuery, onChange: (e) => handleSearchChange(e.target.value), onKeyDown: handleKeyDown, className: "pl-10 pr-4 bg-input-background border-0 rounded-full" })] }) })] }) }));
}
