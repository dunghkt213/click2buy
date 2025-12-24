import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MyStorePageWrapper - Wrapper cho My Store page với Header và Footer
 */
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { MyStorePage } from '../components/store/MyStorePage';
export function MyStorePageWrapper(props) {
    const { storeProducts, storeOrders, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateOrderStatus, cartItemsCount, unreadNotifications, onCartClick, onNotificationsClick, onFilterClick, onPromotionClick, onSupportClick, onStoreClick, onLogoClick, isLoggedIn, user, onLogin, onRegister, cartItems, totalPrice, onLogout, onProfileClick, onOrdersClick, searchQuery, onSearchChange, onSearchClick, cartIconRef, } = props;
    return (_jsxs(_Fragment, { children: [_jsx(Header, { cartItemsCount: cartItemsCount, unreadNotifications: unreadNotifications, onCartClick: onCartClick, onNotificationsClick: onNotificationsClick, onFilterClick: onFilterClick, onPromotionClick: onPromotionClick, onSupportClick: onSupportClick, onStoreClick: onStoreClick, onLogoClick: onLogoClick, isLoggedIn: isLoggedIn, user: user, onLogin: onLogin, onRegister: onRegister, cartItems: cartItems, totalPrice: totalPrice, onLogout: onLogout, onProfileClick: onProfileClick, onOrdersClick: onOrdersClick, searchQuery: searchQuery, onSearchChange: onSearchChange, onSearchClick: onSearchClick, cartIconRef: cartIconRef }), _jsx("main", { className: "pt-16 min-h-screen", children: _jsx(MyStorePage, { storeProducts: storeProducts, storeOrders: storeOrders, onAddProduct: onAddProduct, onUpdateProduct: onUpdateProduct, onDeleteProduct: onDeleteProduct, onUpdateOrderStatus: onUpdateOrderStatus }) }), _jsx(Footer, {})] }));
}
