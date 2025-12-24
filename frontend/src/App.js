import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from "react-router-dom";
import { useScrollRestoration } from "./hooks/useScrollRestoration";
import { AppProvider } from "./providers/AppProvider"; // Context toàn cục
// Layouts
import { PaymentProcessPage } from "@/pages/PaymentProcessPage";
import { MainLayout } from "./layouts/MainLayout";
// Pages (Đảm bảo đường dẫn import đúng với cấu trúc dự án của bạn)
import { ChatFloatingButton } from './components/chat/ChatFloatingButton';
import { AddProductPage } from "./pages/AddProductPage/AddProductPage";
import LoginPage from "./pages/AuthPage/LoginPage/LoginPage";
import RegisterPage from "./pages/AuthPage/RegisterPage/RegisterPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { ChatPage } from "./pages/ChatPage";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { EditProductPage } from "./pages/EditProductPage/EditProductPage";
import { FeedPage } from "./pages/FeedPage/FeedPage";
import { MyStorePage } from "./pages/MyStorePage/MyStorePage";
import { OrderDetailPage } from "./pages/OrderDetailPage/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage/OrdersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { ReviewPage } from "./pages/ReviewPage/ReviewPage";
import { SearchPage } from "./pages/SearchPage/SearchPage";
import { ShopPage } from "./pages/ShopPage/ShopPage";
// Component để khôi phục scroll position khi quay lại trang
// Không còn scroll về đầu trang nữa, thay vào đó sẽ khôi phục vị trí scroll trước đó
function ScrollRestoration() {
    useScrollRestoration(true, 100);
    return null;
}
export default function App() {
    return (
    // 1. Bọc toàn bộ App trong AppProvider để các trang con dùng được Context
    _jsxs(AppProvider, { children: [_jsx(ScrollRestoration, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MainLayout, { children: _jsx(FeedPage, {}) }) }), _jsx(Route, { path: "/feed", element: _jsx(MainLayout, { children: _jsx(FeedPage, {}) }) }), _jsx(Route, { path: "/search", element: _jsx(MainLayout, { children: _jsx(SearchPage, {}) }) }), _jsx(Route, { path: "/product/:id", element: _jsx(MainLayout, { children: _jsx(ProductDetailPage, {}) }) }), _jsx(Route, { path: "/shop", element: _jsx(MainLayout, { children: _jsx(ShopPage, {}) }) }), _jsx(Route, { path: "/cart", element: _jsx(MainLayout, { children: _jsx(CartPage, {}) }) }), _jsx(Route, { path: "/checkout", element: _jsx(MainLayout, { children: _jsx(CheckoutPage, {}) }) }), _jsx(Route, { path: "/payment/process/:orderCode", element: _jsx(PaymentProcessPage, {}) }), _jsx(Route, { path: "/orders", element: _jsx(MainLayout, { children: _jsx(OrdersPage, {}) }) }), _jsx(Route, { path: "/orders/:orderId", element: _jsx(MainLayout, { children: _jsx(OrderDetailPage, {}) }) }), _jsx(Route, { path: "/review/:orderId", element: _jsx(MainLayout, { children: _jsx(ReviewPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(MainLayout, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/profile/:userId", element: _jsx(MainLayout, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/chat", element: _jsx(ChatPage, {}) }), _jsx(Route, { path: "/my-store", element: _jsx(MainLayout, { children: _jsx(MyStorePage, {}) }) }), _jsx(Route, { path: "/my-store/add-product", element: _jsx(MainLayout, { children: _jsx(AddProductPage, {}) }) }), _jsx(Route, { path: "/my-store/edit-product/:id", element: _jsx(MainLayout, { children: _jsx(EditProductPage, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(MainLayout, { children: _jsx(FeedPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(MainLayout, { children: _jsx(FeedPage, {}) }) })] }), _jsx(ChatFloatingButton, {})] }));
}
