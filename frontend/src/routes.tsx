/**
 * Routes - Define all application routes
 */

import { Routes, Route } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage/FeedPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { SearchPage } from './pages/SearchPage/SearchPage';
import LoginPage from './pages/AuthPage/LoginPage/LoginPage';
import RegisterPage from './pages/AuthPage/RegisterPage/RegisterPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

