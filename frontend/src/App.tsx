import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner"; // Thư viện thông báo
import { AppProvider } from "./providers/AppProvider"; // Context toàn cục
import { useScrollRestoration } from "./hooks/useScrollRestoration";

// Layouts
import { PaymentProcessPage } from "@/pages/PaymentProcessPage";
import { MainLayout } from "./layouts/MainLayout";


// Pages (Đảm bảo đường dẫn import đúng với cấu trúc dự án của bạn)
import { ChatFloatingButton } from './components/chat/ChatFloatingButton';
import { NotificationLog } from './components/notifications/NotificationLog';
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
    <AppProvider>
      {/* 2. Toaster để hiển thị thông báo (toast.success, toast.error) */}
      <Toaster position="top-center" richColors closeButton />

      {/* 3. Xử lý khôi phục scroll position khi quay lại trang */}
      <ScrollRestoration />

      {/* 4. Định nghĩa các Routes */}
      <Routes>
        {/* --- NHÓM CÓ LAYOUT (Header + Footer) --- */}
        {/* Trang chủ */}
        <Route path="/" element={<MainLayout><FeedPage /></MainLayout>} />
        <Route path="/feed" element={<MainLayout><FeedPage /></MainLayout>} />

        {/* Trang tìm kiếm & Chi tiết sản phẩm */}
        <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />

        {/* Trang cửa hàng (của người khác) */}
        <Route path="/shop" element={<MainLayout><ShopPage /></MainLayout>} />

        {/* --- CÁC TRANG CHỨC NĂNG USER (Đã kết nối Context, không cần truyền Props) --- */}
        <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><CheckoutPage /></MainLayout>} />
        <Route path="/payment/process/:orderCode" element={<PaymentProcessPage />} />
        <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />
        <Route path="/orders/:orderId" element={<MainLayout><OrderDetailPage /></MainLayout>} />
        <Route path="/review/:orderId" element={<MainLayout><ReviewPage /></MainLayout>} />

        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
        <Route path="/profile/:userId" element={<MainLayout><ProfilePage /></MainLayout>} />

        {/* Trang chat - không có footer */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Trang quản lý cửa hàng (của mình) */}
        <Route path="/my-store" element={<MainLayout><MyStorePage /></MainLayout>} />
        <Route path="/my-store/add-product" element={<MainLayout><AddProductPage /></MainLayout>} />
        <Route path="/my-store/edit-product/:id" element={<MainLayout><EditProductPage /></MainLayout>} />

        {/* --- NHÓM AUTH (Không có Header/Footer) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* OAuth callback (nếu có) */}
        <Route path="/auth/callback" element={<MainLayout><FeedPage /></MainLayout>} />

        {/* 404 - Redirect về trang chủ hoặc trang 404 riêng */}
        <Route path="*" element={<MainLayout><FeedPage /></MainLayout>} />
      </Routes>
      <ChatFloatingButton/>
      <NotificationLog />
    </AppProvider>
  );
}