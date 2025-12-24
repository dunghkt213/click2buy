import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/feed", element: _jsx(FeedPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/profile/:userId", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/search", element: _jsx(SearchPage, {}) }), _jsx(Route, { path: "/", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) })] }));
}
