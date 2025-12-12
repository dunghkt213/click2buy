import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner"; // Thư viện thông báo
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
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { EditProductPage } from "./pages/EditProductPage/EditProductPage";
import { FeedPage } from "./pages/FeedPage/FeedPage";
import { MyStorePage } from "./pages/MyStorePage/MyStorePage";
import { OrdersPage } from "./pages/OrdersPage/OrdersPage";
import { ProductDetailPage } from "./pages/ProductDetailPage/ProductDetailPage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { SearchPage } from "./pages/SearchPage/SearchPage";
import { ShopPage } from "./pages/ShopPage/ShopPage";

// Component cuộn lên đầu trang khi chuyển route
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    // 1. Bọc toàn bộ App trong AppProvider để các trang con dùng được Context
    <AppProvider>
      {/* 2. Toaster để hiển thị thông báo (toast.success, toast.error) */}
      <Toaster position="top-center" richColors closeButton />

      {/* 3. Xử lý cuộn trang */}
      <ScrollToTop />

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
        <Route path="/payment/process" element={<PaymentProcessPage />} />
        <Route path="/orders" element={<MainLayout><OrdersPage /></MainLayout>} />

        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
        <Route path="/profile/:userId" element={<MainLayout><ProfilePage /></MainLayout>} />

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
    </AppProvider>
  );
}