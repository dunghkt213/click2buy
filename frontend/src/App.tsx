import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import LoginPage from "./pages/AuthPage/LoginPage/LoginPage";
import RegisterPage from "./pages/AuthPage/RegisterPage/RegisterPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { FeedPage } from "./pages/FeedPage/FeedPage";
import { MyStorePage } from "./pages/MyStorePage/MyStorePage";
import { OrdersPage } from "./pages/OrdersPage/OrdersPage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { SearchPage } from "./pages/SearchPage/SearchPage";
import { ShopPage } from "./pages/ShopPage/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage/ProductDetailPage";

export default function App() {
  return (
    <Routes>
      {/* Routes with MainLayout (Header, Footer, Sidebars, Modals) */}
      <Route path="/" element={
        <MainLayout>
          <FeedPage />
        </MainLayout>
      } />
      <Route path="/feed" element={
        <MainLayout>
          <FeedPage />
        </MainLayout>
      } />
      <Route path="/profile" element={
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      } />
      <Route path="/profile/:userId" element={
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      } />
      <Route path="/search" element={
        <MainLayout>
          <SearchPage />
        </MainLayout>
      } />
      <Route path="/my-store" element={
        <MainLayout>
          <MyStorePage />
        </MainLayout>
      } />
      <Route path="/cart" element={
        <MainLayout>
          <CartPage />
        </MainLayout>
      } />
      <Route path="/orders" element={
        <MainLayout>
          <OrdersPage />
        </MainLayout>
      } />
      <Route path="/shop" element={
        <MainLayout>
          <ShopPage />
        </MainLayout>
      } />
      <Route path="/product/:id" element={
        <MainLayout>
          <ProductDetailPage />
        </MainLayout>
      } />
      
      {/* Auth routes without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* OAuth callback route */}
      <Route path="/auth/callback" element={
        <MainLayout>
          <FeedPage />
        </MainLayout>
      } />
    </Routes>
  );
}
